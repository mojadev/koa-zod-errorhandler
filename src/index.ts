import type Koa from 'koa';
import { ZodError } from 'zod';
import type { Logger, ZodErrorHandlerOptions } from './types';

const defaultLogOptions: ZodErrorHandlerOptions = {
  log: false,
  transformResponse: defaultTransformer,
};

/**
 * Handle Zod errors gracefully.
 *
 * @returns
 */
export const zodErrorHandler: (options?: ZodErrorHandlerOptions) => Koa.Middleware =
  (options = defaultLogOptions) =>
  async (ctx: Koa.Context, next: Koa.Next) => {
    const logFn: Logger = loggerFromOptions(options);
    try {
      await next();
    } catch (e) {
      const isZodError = e instanceof ZodError;
      if (!isZodError) {
        // do not handle in this middleware
        throw e;
      }

      logFn(e, ctx);
      ctx.status = 400;
      ctx.body = (options.transformResponse ?? defaultTransformer)(e, ctx);
    }
  };

function defaultTransformer(e: ZodError): object {
  return {
    error: 'Bad Request',
    detail: toDetailObject(e),
  };
}

function toDetailObject(e: ZodError<unknown>) {
  return e.issues.reduce(
    (prev, current) => ({
      ...prev,
      [current.path.join('.')]: `${current.message}`,
    }),
    {}
  );
}

function defaultLogImplementation(error: ZodError, ctx: Koa.Context) {
  console.error(`${ctx.req.method} ${ctx.req.url}: ${error.message}`);
}

function loggerFromOptions(options: ZodErrorHandlerOptions): Logger {
  if (options.log === true) {
    return defaultLogImplementation;
  }
  if (!options.log) {
    return () => {
      /* noop */
    };
  }
  return options.log;
}
