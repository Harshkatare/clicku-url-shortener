import type { FocusEvent, FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import {
  createUrlSchema,
  type CreateUrlFormData,
} from "../../features/urls/urls.schemas";
import { createUrl } from "../../features/urls/urls.api";
import type { CreateUrlInput } from "../../features/urls/urls.types";
import { useToastContext } from "../../context/ToastContext";

export function CreateUrlBar() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    formState: { errors },
  } = useForm<CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
    defaultValues: {
      originalUrl: "",
      customAlias: "",
    },
  });

  const createUrlMutation = useMutation({
    mutationFn: createUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["urls"],
      });
      reset({
        originalUrl: "",
        customAlias: "",
      });
      showToast("success", "Short URL created successfully.");
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const message =
          err.response?.data?.message || err.response?.data?.error;

        if (status === 409) {
          setError("customAlias", {
            type: "manual",
            message: message || "This custom alias is already taken.",
          });
          showToast("error", message || "Custom alias already taken.");
          return;
        }

        const isReservedOrAliasError =
          status === 422 ||
          (status === 400 &&
            typeof message === "string" &&
            /alias|reserved|slug/i.test(message));

        if (isReservedOrAliasError) {
          setError("customAlias", {
            type: "manual",
            message: message || "This alias is reserved by the platform.",
          });
          showToast("error", message || "Reserved alias cannot be used.");
          return;
        }

        showToast("error", message || "Failed to create short URL.");
        return;
      }

      showToast("error", "An unexpected error occurred.");
    },
  });

  const handleUrlBlur = (e: FocusEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = `https://${val}`;
      setValue("originalUrl", val, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: CreateUrlFormData) => {
    let targetUrl = data.originalUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const trimmedAlias = data.customAlias?.trim();

    const payload: CreateUrlInput = {
      originalUrl: targetUrl,
      customAlias: trimmedAlias ? trimmedAlias : undefined,
    };

    try {
      await createUrlMutation.mutateAsync(payload);
    } catch {
      // Error handled in onError callback
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    const currentUrl = getValues("originalUrl")?.trim();
    if (currentUrl && !/^https?:\/\//i.test(currentUrl)) {
      setValue("originalUrl", `https://${currentUrl}`);
    }
    return handleSubmit(onSubmit)(e);
  };

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 shadow-xs backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-900/80">
      <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Create Short URL
      </h3>

      <form onSubmit={handleFormSubmit} className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
          {/* Primary Destination URL Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="https://example.com/very-long-url-to-shorten"
              {...register("originalUrl")}
              onBlur={handleUrlBlur}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
            />
            {errors.originalUrl && (
              <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          {/* Inline Custom Vanity Alias Input */}
          <div className="relative sm:w-44 md:w-52 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400 select-none dark:text-slate-500">
              /
            </div>
            <input
              type="text"
              placeholder="custom alias (opt)"
              {...register("customAlias")}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-6 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
              title="Custom vanity alias (optional)"
            />
            {errors.customAlias && (
              <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                {errors.customAlias.message}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {createUrlMutation.isPending ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <span>Shorten</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
