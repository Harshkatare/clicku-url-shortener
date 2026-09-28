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
    "Custom alias can only contain letters, numbers, hyphens, and underscores"
  )
  .refine(
    (val) => !RESERVED_SLUGS.has(val.toLowerCase()),
    {
      message: "This alias is reserved for system use. Please choose another.",
    }
  );

const destinationUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .refine(
    (val) => /^https?:\/\//i.test(val),
    "URL must start with http:// or https://"
  );

export const createUrlSchema = z.object({
  originalUrl: destinationUrlSchema,
  customAlias: customAliasSchema.optional().or(z.literal("")),
  status: z.enum(["active", "expiring", "archived"]).default("active").optional(),
});

export const updateUrlSchema = z
  .object({
    originalUrl: destinationUrlSchema.optional(),
    customAlias: customAliasSchema.nullable().optional().or(z.literal("")),
    status: z.enum(["active", "expiring", "archived"]).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

export const reorderUrlSchema = z.object({
  newSortOrder: z
    .number()
    .int("Sort order must be an integer")
    .min(0, "Sort order cannot be negative"),
});

export type CreateUrlFormData = z.infer<typeof createUrlSchema>;
export type UpdateUrlFormData = z.infer<typeof updateUrlSchema>;
export type ReorderUrlFormData = z.infer<typeof reorderUrlSchema>;