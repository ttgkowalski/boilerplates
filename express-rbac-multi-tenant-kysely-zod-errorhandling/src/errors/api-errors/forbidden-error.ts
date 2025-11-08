import { ApiError } from "./api-error";

export class ForbiddenError extends ApiError {
  public statusCode = 403;

  constructor(message = "Forbidden", options?: { cause?: Error }) {
    super(message, options);
  }
}

