import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  updateProfileSchema,
  type UpdateProfileSchemaInput,
} from "../../features/user/user.schemas";
import { useUpdateProfile } from "../../features/user/user.hooks";
import { useToastContext } from "../../context/ToastContext";
import type { User } from "../../features/auth/auth.types";

interface ProfileCardProps {
  user?: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const { showToast } = useToastContext();
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileSchemaInput>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  async function onSubmit(data: UpdateProfileSchemaInput) {
    try {
      await updateProfileMutation.mutateAsync(data);
      showToast("success", "Profile updated successfully");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError("email", {
            type: "manual",
            message: "Email is already registered",
          });
          return;
        }
        const message =
          err.response?.data?.message || "Failed to update profile";
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
          Profile Information
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Update your display name and email address.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="profile-name"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            {...register("name")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Email Address
          </label>
          <input
            id="profile-email"
            type="email"
            {...register("email")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || !isDirty}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
