import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.url("Invalid URL"),
});

export type CreateUrlInput = z.infer<
  typeof createUrlSchema
>;