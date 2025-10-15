import { z } from "zod";

export const paramsWithIdSchema = z.object({ id: z.string().min(1) });