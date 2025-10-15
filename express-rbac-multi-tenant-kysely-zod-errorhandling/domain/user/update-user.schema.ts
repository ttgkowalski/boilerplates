import { z } from "zod";

export const updateUserSchema = z.object({
    tenant_id: z.string().nullable().optional(),
    email: z.string().email().optional(),
    password: z.string().min(1).optional(),
    role: z.enum(["User"]).optional(),
  }).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field required" });