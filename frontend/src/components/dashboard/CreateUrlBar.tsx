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
import { env } from "../../config/env";

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
    watch,
    formState: { errors },
  } = useForm<CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
    defaultValues: {
      originalUrl: "",
      customAlias: "",
    },
  });

  const originalUrlValue = watch("originalUrl");
  const isUrlEmpty = !originalUrlValue || originalUrlValue.trim() === "";

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

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        showToast("info", "Clipboard access not supported in this browser.");
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        let val = text.trim();
        if (val && !/^https?:\/\//i.test(val)) {
          val = `https://${val}`;
        }
        setValue("originalUrl", val, { shouldValidate: true });
      }
    } catch {
      showToast("info", "Please paste URL manually (clipboard permission restricted).");
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

  const domainDisplay =
    (env.SHORT_URL_BASE || "shortlynk.in")
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "") + "/";

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-xs transition-colors duration-150 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <form onSubmit={handleFormSubmit}>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Destination URL Input Well */}
          <div className="relative flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50/80 transition-colors duration-150 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-slate-800 dark:bg-slate-950/70 dark:focus-within:border-blue-500">
            {/* Permanent Link Icon on Left Edge */}
            <div className="pointer-events-none pl-3 pr-2 text-slate-400 dark:text-slate-500 shrink-0">
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
              autoComplete="on"
              placeholder="https://example.com/very-long-url-to-shorten"
              {...register("originalUrl")}
              onBlur={handleUrlBlur}
              className="h-10 w-full bg-transparent pr-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:h-11 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            {/* 1-Click Clipboard Paste Badge on Inside Right Edge next to Shorten CTA */}
            {isUrlEmpty && (
              <div className="pr-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  title="Paste URL from clipboard"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>Paste</span>
                </button>
              </div>
            )}
          </div>

          {/* Custom Vanity Alias Well with Distinct Domain Prefix Badge */}
          <div className="relative flex shrink-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 transition-colors duration-150 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 sm:w-56 md:w-64 dark:border-slate-800 dark:bg-slate-950/70 dark:focus-within:border-blue-500">
            {/* Distinct Highlighted Domain Prefix Badge */}
            <span className="inline-flex h-10 sm:h-11 items-center border-r border-slate-200 bg-slate-100 px-2.5 text-xs font-mono font-medium text-slate-600 select-none shrink-0 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              {domainDisplay}
            </span>
            <input
              type="text"
              autoComplete="on"
              placeholder="custom-slug"
              {...register("customAlias")}
              className="h-10 w-full bg-transparent pl-2 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none sm:h-11 dark:text-slate-100 dark:placeholder:text-slate-500"
              title="Custom vanity alias (optional)"
            />
          </div>

          {/* Primary Shorten CTA */}
          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="inline-flex h-10 sm:h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Validation Error Feedback Strip */}
          {(errors.originalUrl || errors.customAlias) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-2 pt-2 text-xs font-medium text-red-500 dark:border-slate-800/80 dark:text-red-400">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {errors.originalUrl?.message || errors.customAlias?.message}
              </span>
            </div>
          )}
        </form>
      </div>
  );
}
