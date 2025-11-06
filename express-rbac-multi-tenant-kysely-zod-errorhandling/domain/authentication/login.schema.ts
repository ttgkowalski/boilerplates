import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(), // z.string().email() is deprecated
  // bcrypt uses only the first 71 chars; the rest are ignored
  password: z.string().min(8).max(70),
});
