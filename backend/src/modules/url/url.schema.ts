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

export const urlParamsSchema = z.object({
  id: z.string()
    .uuid("Invalid URL ID format"),
});

export type UrlParamsInput = z.infer<typeof urlParamsSchema>;

export const claimUrlSchema = z.object({
  shortCode: z
    .string()
    .trim()
    .min(1, "Short code cannot be empty")
    .max(20, "Short code cannot exceed 20 characters"),
});

export type ClaimUrlInput = z.infer<typeof claimUrlSchema>;