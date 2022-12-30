import type { ZodError } from 'zod';
import type Koa from 'koa';

/**
 * A logging function for informing about zod errors.
 *
 * @param error     The ZodError that occurred.
 * @param ctx       The Koa context that triggered this zod error.
 */
export type Logger = (error: ZodError, ctx: Koa.Context) => void;

/**
 * A transformer that turns a ZodError into a response object.
 *
 * In case you want to set special headers you can use the ctx parameter.
 *
 * @param error     The zod error to transform to a response
 * @param ctx       The Koa context that triggered this zod error.
 *
 * @returns An object that will be returned.
 */
export type ResponseTransformer = (error: ZodError, ctx: Koa.Context) => object | string;

/**
 * Customize the behaviour of the error handler.
 *
 * The error handler comes with a default behavior, but allows you
 * to customize it using ZodErrorHandlerOptions.
 */
export interface ZodErrorHandlerOptions {
  /**
   * Modify the way zod errors are logged.
   *
   * This can be either a function that handles logging in a custom way
   * or a boolean that indicates whether logging (using console.log) should be activated or not.
   *
   * Logging is disabled by default.
   *
   * @returns void
   * @param message     The message to log
   * @param ctx         The log context
   */
  log?: Logger | boolean;

  /**
   * Provide a custom response function for handling zod errors.
   *
   * By default the implementation returns the zod details and fields that failed, but in many
   * cases it makes sense to have a custom implementation.
   */
  transformResponse?: ResponseTransformer | undefined;
}
