import { ApiError } from "./api-error";

export class UnauthorizedError extends ApiError {
  public statusCode = 401;

  constructor(message = "Unauthorized", options?: { cause?: Error }) {
    super(message, options);
  }
}

