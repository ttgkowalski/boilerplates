import { ApiError } from "./api-error";

export class InternalServerError extends ApiError {
  public statusCode = 500;

  constructor(message = "Internal Server Error", options?: { cause?: Error }) {
    super(message, options);
  }
}