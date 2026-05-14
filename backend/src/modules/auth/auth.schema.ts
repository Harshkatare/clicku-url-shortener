import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type SignupInput = z.infer<typeof signupSchema>;


export const loginSchema = z.object({
  email: z.email(),

  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;