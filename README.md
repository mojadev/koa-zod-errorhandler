# koa-zod-errorhandler

A simple koa middleware that handles zod parse errors.

## 📕 TL;DR:

- automatically catches ZodErrors, so you don't need to
- returns a 400 Bad Request with a default response
- allows you to customize the error and logging behaviour

## 💡 About

This [Koa](https://koajs.com/) middleware allows you validate input using [zods](https://zod.dev/) parse() function
without the need to try/catch. It detects ZodErrors and by default returns a 400 Bad Request with a payload containing the
fields that caused validation errors:

```json
{
  "error": "Bad Request",
  "detail": {
    "name": "Invalid input"
  }
}
```

Using this middleware can make your code more concise and easier to read, as you don't need to add try/catch blocks for ZodErrors. It can also help you standardize the error handling in your Koa application.

## Installation

Add the middleware to your dependencies (make sure you have zod in your dependencies):

```
# Yarn
yarn add koa-zod-errorhandler

# npm
npm install koa-zod-errorhandler
```

Add the middleware to your koa instance:

```ts
const app = new Koa();

/// ... etc ...

app.use(zodErrorHandler());

// or provide extra options
app.use(
  zodErrorHandler({
    log: myLogFn,
    transformResponse: myResponseTransformer,
  })
);
```

Validate using zod (no special code needed for the middleware):

```ts
router.post('/', bodyParser(), (ctx) => {
  const bodyPayload = z
    .object({
      name: z.string(),
    })
    .parse(ctx.request.body);

  // do something
  ctx.response.status = 200;
});
```

## 🛠️ Options

The middleware takes an optional object with the following options:

- **log: (boolean or logger function, default: false)**:  
  Modify the way zod errors are logged.  
  This can be either a function that handles logging in a custom way or a boolean that indicates whether logging (using console.log) should be activated or not. Logging is disabled by default.

  Log functions get the `ZodError` as the first argument and the `Koa.Context` as the second, allowing you to log additional information about a request.

  ```ts
  export type Logger = (error: ZodError, ctx: Koa.Context) => void;
  ```

  **_Example_: Using your own logger**

  ```ts
  app.use(
    zodErrorHandler({
      log: (error: ZodError) => {
        myLogger.debug({ traceId: myTraceId, error }, 'A user provided an invalid payload');
      },
    })
  );
  ```

- **transformResponse: (transform function, default: undefined)**  
   Transform the `ZodError` for the response and set additional values like headers in the Koa context if you need to.

  Transformer functions get the `ZodError` as the first argument and the `Koa.Context` as the second, allowing you to modify the response further. They expect you to return an object or an string.

  ```ts
  export type ResponseTransformer = (error: ZodError, ctx: Koa.Context) => object | string;
  ```

  **_Example_: Return a response without any information to the user**

  ```ts
  app.use(
    zodErrorHandler({
      transformResponse: (_error: ZodError, ctx: Koa.Context) => {
        // act like the ressource does not exist
        ctx.status = 404;
        return { error: 'Resource not found' };
      },
    })
  );
  ```

## Maintainers

[@mojadev](https://github.com/mojadev)

## Contributing

Feel free to dive in! [Open an issue](https://github.com/mojadev/koa-zod-errorhandler/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Jannis Gansen
