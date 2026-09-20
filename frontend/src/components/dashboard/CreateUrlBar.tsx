import { useState, type FocusEvent, type FormEvent } from "react";
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
  const [isAliasOpen, setIsAliasOpen] = useState(false);
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
      setIsAliasOpen(false);
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
          setIsAliasOpen(true);
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
          setIsAliasOpen(true);
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

  const domainDisplay =
    (env.SHORT_URL_BASE || "shortlynk.in").replace(/^https?:\/\//, "") + "/";

  return (
    <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-900/80">
      <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Create Short URL
      </h3>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Primary Destination URL Input & Submit Action */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <svg
                className="h-5 w-5"
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
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-slate-900 placeholder:text-slate-400 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
            />
          </div>

          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition-all duration-150 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <span>Shorten URL</span>
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

        {errors.originalUrl && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors.originalUrl.message}
          </p>
        )}

        {/* Expandable Vanity Alias Drawer Toggle */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setIsAliasOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isAliasOpen ? "rotate-90 text-blue-600 dark:text-blue-400" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span>⚡ Customize back-half (optional vanity slug)</span>
          </button>
        </div>

        {/* Expandable Vanity Slug Drawer */}
        {isAliasOpen && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200 dark:border-slate-800 dark:bg-slate-800/40">
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Custom Vanity Alias
            </label>
            <div className="flex items-center">
              <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 px-3.5 text-xs font-semibold text-slate-500 select-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {domainDisplay}
              </span>
              <input
                type="text"
                placeholder="my-custom-link"
                {...register("customAlias")}
                className="h-11 flex-1 rounded-r-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
              />
            </div>
            {errors.customAlias ? (
              <p className="mt-1.5 text-xs font-medium text-red-500 dark:text-red-400">
                {errors.customAlias.message}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                3–50 characters. Letters, numbers, hyphens, and underscores only.
              </p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
