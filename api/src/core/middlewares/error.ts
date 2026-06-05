import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { HttpStatus } from "../utils/statusCode";
import { log } from "./logger";

type ThrowErrorInput = {
  error: unknown;
  logError?: string;
  exceptionStatus?: HttpStatus;
  exceptionErrorMessage?: string;
  extra?: Record<string, unknown>;
};

export function throwError({
  error,
  logError = "An error occurred: ",
  exceptionStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  exceptionErrorMessage = "Internal Server Error",
  extra = {},
}: ThrowErrorInput): never {
  if (error instanceof HTTPException) {
    throw error;
  }

  log.withMetadata({ error }).error(logError);

  throw new HTTPException(exceptionStatus as ContentfulStatusCode, {
    message: exceptionErrorMessage,
    ...extra,
  });
}

// Backward-compatible alias for legacy code while migrating to throwError.
export function catchError(input: ThrowErrorInput): never {
  return throwError(input);
}

export const GENERIC_NOT_FOUND_MESSAGE = "resource not found";
export const GENERIC_BAD_REQUEST_MESSAGE = "invalid request";
export const GENERIC_SERVER_ERROR_MESSAGE = "request could not be processed";
