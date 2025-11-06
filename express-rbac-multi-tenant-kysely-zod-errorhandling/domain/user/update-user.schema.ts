import { z } from "zod";

export const updateUserSchema = z.object({
    tenant_id: z.string().nullable().optional(),
    email: z.email().optional(),// z.string().email() is deprecated
    // bcrypt uses only the first 71 chars; the rest are ignored
    password: z.string().min(1).max(70).optional(),
    role: z.enum(["User"]).optional(),
  }).refine((obj) => Object.keys(obj).length > 0, { message: "At least one field required" });