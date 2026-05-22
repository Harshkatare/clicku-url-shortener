import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.url("Invalid URL"),
});

export type CreateUrlInput = z.infer<
  typeof createUrlSchema
>;

export const updateUrlSchema = z.object({
  originalUrl: z
    .url("Invalid URL")
    .optional(),
});

export type updateUrlInput = z.infer<
  typeof updateUrlSchema
>;