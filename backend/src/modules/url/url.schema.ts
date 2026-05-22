import { z } from "zod";

export const createUrlSchema = z.object({
  originalUrl: z.url("Invalid URL"),
});

export type CreateUrlInput = z.infer<
  typeof createUrlSchema
>;

export const updateUrlSchema = z
  .object({
    originalUrl: z
      .url("Invalid URL")
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided",
    }
  );

export type updateUrlInput = z.infer<
  typeof updateUrlSchema
>;