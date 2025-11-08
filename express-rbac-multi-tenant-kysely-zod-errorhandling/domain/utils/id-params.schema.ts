import { z } from "zod";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const paramsWithIdSchema = z.object({ 
  id: z.string().min(1).refine((val) => uuidRegex.test(val), {
    message: "Invalid UUID format"
  })
});