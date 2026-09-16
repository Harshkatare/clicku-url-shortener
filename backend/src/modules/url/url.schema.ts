import { z } from "zod";

export const RESERVED_SLUGS = new Set([
  // Core Auth & Accounts
  "login",
  "signin",
  "logout",
  "signout",
  "register",
  "signup",
  "auth",
  "account",
  "profile",
  "user",
  "users",

  // Dashboard & Application
  "dashboard",
  "analytics",
  "links",
  "urls",
  "settings",
  "preview",
  "overview",
  "app",

  // Marketing & Informational Pages
  "pricing",
  "features",
  "faq",
  "about",
  "contact",
  "support",
  "help",
  "docs",
  "documentation",
  "blog",
  "news",
  "status",

  // Legal & Compliance
  "terms",
  "privacy",
  "legal",
  "security",
  "cookie-policy",
  "dmca",

  // System, API & Infrastructure
  "api",
  "health",
  "metrics",
  "stats",
  "demo",
  "claim",
  "admin",
  "root",
  "system",

  // Static Files & Web Crawlers
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "assets",
  "static",
  "public",
  "images",
  "fonts",
  "css",
  "js",
  "manifest.json",
]);

export const customAliasSchema = z
  .string()
  .trim()
  .min(3, "Custom alias must be at least 3 characters")
  .max(50, "Custom alias cannot exceed 50 characters")
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
    customAlias: customAliasSchema.nullable().optional(),
    status: z.enum(["active", "expiring", "archived"]).optional(),
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

export const urlQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(100, "Search query cannot exceed 100 characters")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  status: z.enum(["active", "expiring", "archived", "all"]).default("all"),
  page: z.coerce
    .number({ message: "Page must be a valid number" })
    .int("Page must be an integer")
    .positive("Page must be greater than 0")
    .default(1),
  limit: z.coerce
    .number({ message: "Limit must be a valid number" })
    .int("Limit must be an integer")
    .positive("Limit must be greater than 0")
    .max(50, "Limit cannot exceed 50 items per page")
    .default(10),
  sortBy: z.enum(["createdAt", "clicks", "sortOrder"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type UrlQueryInput = z.infer<typeof urlQuerySchema>;
