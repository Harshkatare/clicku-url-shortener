import { z } from "zod";

export const customAliasSchema = z
  .string()
  .trim()
  .min(3, "Custom alias must be at least 3 characters")
  .max(50, "Custom alias cannot exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Custom alias can only contain letters, numbers, hyphens, and underscores"
  );

export const createUrlSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
  customAlias: customAliasSchema.optional().or(z.literal("")),
  status: z.enum(["active", "expiring", "archived"]).default("active").optional(),
});

export const updateUrlSchema = z
  .object({
    originalUrl: z.string().url("Please enter a valid URL").optional(),
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