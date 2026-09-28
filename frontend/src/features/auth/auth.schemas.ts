import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z
        .string()
        .min(1, "Password is required")
        .max(128, "Password cannot exceed 128 characters"),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters"),
    email: z.email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password cannot exceed 128 characters"),
});

export type LoginFormData =
    z.infer<typeof loginSchema>;

export type RegisterFormData =
    z.infer<typeof registerSchema>;