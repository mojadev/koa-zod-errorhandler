import Koa from 'koa';
import Router from '@koa/router';
import request from 'supertest';
import bodyParser from 'koa-bodyparser';
import { zodErrorHandler } from '.';
import { z, ZodError } from 'zod';

const payloadSchema = z.object({
  name: z.string(),
});

describe('koa zod middleware', () => {
  let app: Koa;
  let server: ReturnType<Koa['listen']>;
  const logMock = jest.fn();

  beforeEach(() => {
    logMock.mockReset();
    startServer();
  });

  afterEach(async () => {
    await stopServer();
  });

  it('should change the result of a successful koa request', async () => {
    const response = await request(app.callback()).post('/').send({ name: 'user' });

    expect(response.status).toEqual(200);
  });

  it('should return a 400 in case of invalid requests', async () => {
    const response = await request(app.callback()).post('/').send({});

    expect(response.status).toEqual(400);
  });

  it('should use a default response for requests with invalid parameters', async () => {
    const response = await request(app.callback()).post('/').send({});

    expect(response.body).toEqual({
      error: 'Bad Request',
      detail: {
        name: 'Required',
      },
    });
  });

  it('should allow to transform the response by providing a transformer', async () => {
    await stopServer();
    const customTransform = jest.fn();
    customTransform.mockImplementation(() => ({
      error: 'custom error',
    }));
    startServer(zodErrorHandler({ transformResponse: customTransform }));

    const response = await request(app.callback()).post('/').send({});

    expect(customTransform).toBeCalledTimes(1);
    expect(response.body).toEqual({ error: 'custom error' });
  });

  it('should call the log function with the zod error and the context on failed requests', async () => {
    await request(app.callback()).post('/').send({});

    expect(logMock).toHaveBeenCalledTimes(1);
    expect(logMock.mock.calls[0][0] instanceof ZodError).toBeTruthy();
    expect(logMock.mock.calls[0][1].request.path).toEqual('/');
  });

  function startServer(middleware = zodErrorHandler({ log: logMock })) {
    app = new Koa();
    const router = new Router();
    router.post('/', bodyParser(), (ctx) => {
      payloadSchema.parse(ctx.request.body);
      ctx.response.status = 200;
    });
    app.use(middleware);
    app.use(router.routes());
    app.use(router.allowedMethods());
    server = app.listen();
  }

  async function stopServer() {
    await new Promise<void>((resolve, reject) =>
      server?.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    );
  }
});
