import { z } from "zod";

export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "signup",
  "dashboard",
  "analytics",
  "settings",
  "preview",
  "api",
  "health",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "admin",
  "assets",
  "static",
  "faq",
]);

export const customAliasSchema = z
  .string()
  .trim()
  .min(3, "Custom alias must be at least 3 characters")
  .max(30, "Custom alias cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, hyphens, and underscores are allowed"
  )
  .refine(
    (val) => !RESERVED_SLUGS.has(val.toLowerCase()),
    {
      message: "This alias is reserved for system use. Please choose another.",
    }
  );

export const createUrlSchema = z.object({
  originalUrl: z.url("Invalid URL"),
  customAlias: customAliasSchema.optional(),
  status: z.enum(["active", "expiring", "archived"]).default("active"),
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
