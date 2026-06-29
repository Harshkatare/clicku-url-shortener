import { z } from "zod";

export const createUrlSchema = z.object({
    originalUrl: z.url("Please enter a valid URL"),
});

export type CreateUrlFormData = z.infer< 
        typeof createUrlSchema
>;