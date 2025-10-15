import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors";
import { InternalServerError } from "../errors/api-errors";

export function GlobalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toResponse());
    return;
  }

  const internal = new InternalServerError("Unexpected error", {
    cause: err instanceof Error ? err : undefined,
  });
  res.status(500).json(internal.toResponse());
}