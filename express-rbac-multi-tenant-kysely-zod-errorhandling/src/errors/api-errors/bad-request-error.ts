import { ApiError } from "./api-error"

export class BadRequestError extends ApiError {
  public statusCode = 400;

  constructor(message = "Bad Request", options?: { cause?: Error }) {
    super(message, options);
  }
}