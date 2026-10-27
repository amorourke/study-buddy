import type { ErrorRequestHandler, Request } from "express";
import { z } from "zod";
import type { ApiErrorBody, FieldErrors } from "../shared/types.ts";

export class HttpError extends Error {
  readonly status: number;
  readonly fieldErrors?: FieldErrors;

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function notFound(resource: string): HttpError {
  return new HttpError(404, `${resource} not found`);
}

export function conflict(field: string, message: string): HttpError {
  return new HttpError(409, message, { [field]: [message] });
}

export function forbidden(message: string): HttpError {
  return new HttpError(403, message);
}

export function paramId(req: Request, name: string): number {
  const value = Number(req.params[name]);
  if (!Number.isInteger(value) || value <= 0) throw new HttpError(404, "Not found");
  return value;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let status = 500;
  let body: ApiErrorBody = { message: "Something went wrong. Please try again." };

  if (error instanceof z.ZodError) {
    status = 400;
    body = { message: "Please fix the errors below.", fieldErrors: z.flattenError(error).fieldErrors };
  } else if (error instanceof HttpError) {
    status = error.status;
    body = { message: error.message, fieldErrors: error.fieldErrors };
  } else {
    console.error(error);
  }

  res.status(status).json(body);
};
