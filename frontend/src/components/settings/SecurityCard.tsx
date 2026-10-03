import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  changePasswordSchema,
  type ChangePasswordSchemaInput,
} from "../../features/user/user.schemas";
import { useChangePassword } from "../../features/user/user.hooks";
import { useToastContext } from "../../context/ToastContext";
import { PasswordStrengthMeter } from "../auth/PasswordStrengthMeter";

export function SecurityCard() {
  const { showToast } = useToastContext();
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordSchemaInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  async function onSubmit(data: ChangePasswordSchemaInput) {
    try {
      await changePasswordMutation.mutateAsync(data);
      showToast("success", "Password updated successfully");
      reset();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("currentPassword", {
            type: "manual",
            message: "Current password is incorrect",
          });
          return;
        }
        if (err.response?.status === 400) {
          const msg =
            err.response?.data?.message ||
            "Password does not meet strength requirements";
          setError("newPassword", {
            type: "manual",
            message: String(msg),
          });
          return;
        }
        const message =
          err.response?.data?.message || "Failed to update password";
        showToast("error", String(message));
        return;
      }
      showToast("error", "An unexpected error occurred");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 transition-colors">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Security & Password
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Rotate your account password. Must include uppercase, lowercase, numbers, and special characters.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="current-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="••••••••"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="••••••••"
          />
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.newPassword.message}
            </p>
          )}
          <PasswordStrengthMeter password={newPassword || ""} />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
