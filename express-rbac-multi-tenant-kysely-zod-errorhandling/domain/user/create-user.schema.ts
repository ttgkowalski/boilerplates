import { z } from "zod";

export const createUserSchema = z.object({
    tenant_id: z.string().nullable().optional(),
    email: z.email(),// z.string().email() is deprecated
    // bcrypt uses only the first 71 chars; the rest are ignored
    password: z.string().min(1).max(70),
    role: z.enum(["User"]).default("User"),
    created_at: z.preprocess((v) => (typeof v === "string" || v instanceof Date ? new Date(v) : v), z.date()).optional(),
  });