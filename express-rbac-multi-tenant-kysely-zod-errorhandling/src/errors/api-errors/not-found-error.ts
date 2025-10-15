import { ApiError } from "./api-error";

export class NotFoundError extends ApiError {
  public statusCode = 404;

  constructor(resource = "Resource") {
    super(`${resource} not found`);
  }
}