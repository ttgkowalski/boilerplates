import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodTypeAny } from "zod";

type Schemas = {
  body?: ZodSchema<unknown> | ZodTypeAny;
  params?: ZodSchema<unknown> | ZodTypeAny;
  query?: ZodSchema<unknown> | ZodTypeAny;
  headers?: ZodSchema<unknown> | ZodTypeAny;
};

export function validateSchema(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.headers) {
        const parsed = schemas.headers.parse(req.headers);
        (req as any).headers = parsed as any;
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        (req as any).params = parsed;
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        (req as any).query = parsed as any;
      }
      if (schemas.body) {
        const parsed = schemas.body.parse(req.body);
        req.body = parsed as any;
      }
      next();
    } catch (err: any) {
      if (err?.issues) {
        return res.status(400).json({ errors: err.issues });
      }
      return res.status(400).json({ error: String(err?.message || err) });
    }
  };
}


