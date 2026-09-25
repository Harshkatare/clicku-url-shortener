import { useEffect, useCallback, type FocusEvent, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import {
  updateUrlSchema,
  type UpdateUrlFormData,
} from "../../features/urls/urls.schemas";
import { updateUrl } from "../../features/urls/urls.api";
import type { Url, UpdateUrlInput } from "../../features/urls/urls.types";
import { useToastContext } from "../../context/ToastContext";
import { env } from "../../config/env";

export interface EditUrlModalProps {
  url: Url | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUrlModal({ url, isOpen, onClose }: EditUrlModalProps) {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateUrlFormData>({
    resolver: zodResolver(updateUrlSchema),
    // React 19 Zero-CLS native RHF hydration
    values: url
      ? {
          originalUrl: url.originalUrl,
          customAlias: url.customAlias || "",
          status: url.status,
        }
      : undefined,
  });

  const currentStatus = useWatch({ control, name: "status" });

  const updateUrlMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUrlInput }) =>
      updateUrl(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      // Invalidate portfolio stats in case status was transitioned
      queryClient.invalidateQueries({ queryKey: ["urls", "stats"] });
      showToast("success", "Link updated successfully.");
      onClose();
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
          return;
        }

        // Exact match for Commit 14b surgical error handling parity
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
          return;
        }

        showToast("error", message || "Failed to update short URL.");
        return;
      }
      showToast("error", "An unexpected error occurred.");
    },
  });

  // Lock body scroll and handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      // Reset form to clear validation errors when closed
      if (url) {
        reset({
          originalUrl: url.originalUrl,
          customAlias: url.customAlias || "",
          status: url.status,
        });
      }
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, reset, url]);

  if (!isOpen || !url || typeof document === "undefined") return null;

  const handleUrlBlur = (e: FocusEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (val && !/^https?:\/\//i.test(val)) {
      val = `https://${val}`;
      setValue("originalUrl", val, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: UpdateUrlFormData) => {
    let targetUrl = data.originalUrl?.trim();
    if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const trimmedAlias = data.customAlias?.trim();
    const explicitAlias = trimmedAlias ? trimmedAlias : null; // send explicit null to clear alias in DB

    // Only send fields that actually changed
    const payload: UpdateUrlInput = {};
    if (targetUrl && targetUrl !== url.originalUrl) {
      payload.originalUrl = targetUrl;
    }
    if (explicitAlias !== (url.customAlias || null)) {
      payload.customAlias = explicitAlias;
    }
    if (data.status && data.status !== url.status) {
      payload.status = data.status;
    }

    if (Object.keys(payload).length === 0) {
      onClose(); // No mutations made
      return;
    }

    try {
      await updateUrlMutation.mutateAsync({ id: url.id, data: payload });
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
  const inputClass =
    "h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/30";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="no-scrollbar relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all sm:p-7 dark:border-slate-800 dark:bg-slate-900 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Pinned to Top-Right Corner) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer sm:right-5 sm:top-5"
          title="Close modal"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            Edit Short Link
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Update the destination, customize the alias, or change lifecycle status.
          </p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination URL
            </label>
            <input
              type="text"
              placeholder="https://example.com"
              {...register("originalUrl")}
              onBlur={handleUrlBlur}
              className={inputClass}
            />
            {errors.originalUrl && (
              <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom Vanity Alias (Optional)
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
                Clear this field to use the auto-generated short code ({url.shortCode}).
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(["active", "expiring", "archived"] as const).map((s) => (
                <label
                  key={s}
                  className={`flex-1 cursor-pointer rounded-lg py-2 text-center text-xs font-semibold transition-all ${
                    currentStatus === s
                      ? "bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    value={s}
                    {...register("status")}
                    className="hidden"
                  />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateUrlMutation.isPending}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateUrlMutation.isPending}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {updateUrlMutation.isPending ? (
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
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
