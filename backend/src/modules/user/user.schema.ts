import { z } from "zod";

// change-password enforces entropy; signup is length-only — intentional, do not retro-fit.

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required to confirm account deletion"),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
