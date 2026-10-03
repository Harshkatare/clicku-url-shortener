import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  deleteAccountSchema,
  type DeleteAccountSchemaInput,
} from "../../features/user/user.schemas";
import { useDeleteAccount } from "../../features/user/user.hooks";
import { useToastContext } from "../../context/ToastContext";

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const deleteAccountMutation = useDeleteAccount();
  const isBackdropMouseDown = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountSchemaInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleteAccountMutation.isPending) {
        onClose();
      }
    },
    [onClose, deleteAccountMutation.isPending]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      reset();
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, reset]);

  if (!isOpen || typeof document === "undefined") return null;

  async function onSubmit(data: DeleteAccountSchemaInput) {
    try {
      await deleteAccountMutation.mutateAsync(data);
      onClose();
      showToast("info", "Your account has been deleted");
      navigate("/register", { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("password", {
            type: "manual",
            message: "Password is incorrect",
          });
          return;
        }
        const message =
          err.response?.data?.message || "Failed to delete account";
        showToast("error", String(message));
        return;
      }
      showToast("error", "An unexpected error occurred");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleteAccountMutation.isPending) {
          isBackdropMouseDown.current = true;
        }
      }}
      onMouseUp={(e) => {
        if (
          e.target === e.currentTarget &&
          isBackdropMouseDown.current &&
          !deleteAccountMutation.isPending
        ) {
          onClose();
        }
        isBackdropMouseDown.current = false;
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/60 dark:bg-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Account
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action cannot be undone. All shortened URLs, custom aliases, and click records associated with this account will be permanently deleted.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="delete-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Enter Password to Confirm
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              disabled={deleteAccountMutation.isPending}
              {...register("password")}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:bg-slate-900 transition disabled:opacity-50"
              placeholder="Your current password"
              autoFocus
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!deleteAccountMutation.isPending) {
                  onClose();
                }
              }}
              disabled={deleteAccountMutation.isPending}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteAccountMutation.isPending}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete My Account"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
