import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
});

export type LoginFormData =
    z.infer<typeof loginSchema>;

export type RegisterFormData =
    z.infer<typeof registerSchema>;