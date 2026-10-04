import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { createUrl } from "../../features/urls/urls.api";
import { env } from "../../config/env";
import { useToastContext } from "../../context/ToastContext";
import { copyToClipboard } from "../../utils/copy";

interface OnboardingModalProps {
  isOpen: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function OnboardingModal({
  isOpen,
  step,
  onNext,
  onPrev,
  onClose,
}: OnboardingModalProps) {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [inputUrl, setInputUrl] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBackdropMouseDown = useRef(false);

  const createUrlMutation = useMutation({
    mutationFn: (url: string) => createUrl({ originalUrl: url }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["urls", "stats"] });
      const slug = data.data.customAlias || data.data.shortCode;
      setCreatedSlug(slug);
      setErrorMsg(null);
      showToast("success", "First short link created");
    },
    onError: (err: unknown) => {
      let msg = "Failed to create short link";
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      setErrorMsg(msg);
    },
  });

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
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleBlur = () => {
    const trimmed = inputUrl.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      setInputUrl(`https://${trimmed}`);
    }
  };

  const handleShorten = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setInputUrl(normalized);
    setErrorMsg(null);
    createUrlMutation.mutate(normalized);
  };

  const shortBase = env.SHORT_URL_BASE || "https://shortlynk.in";
  const fullShortUrl = createdSlug ? `${shortBase}/${createdSlug}` : "";

  const handleCopy = async () => {
    if (!fullShortUrl) return;
    const ok = await copyToClipboard(fullShortUrl);
    if (ok) {
      showToast("success", "Short link copied to clipboard");
    } else {
      showToast("error", "Failed to copy link");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onMouseDown={(e) => {
        isBackdropMouseDown.current = e.target === e.currentTarget;
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && isBackdropMouseDown.current) {
          onClose();
        }
        isBackdropMouseDown.current = false;
      }}
    >
      <div
        className="w-full max-w-lg min-w-0 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Stepper & Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => {
              const active = i <= step;
              const isCurrent = i === step;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    } ${isCurrent ? "ring-2 ring-blue-300 dark:ring-blue-800" : ""}`}
                  >
                    {i}
                  </div>
                  {i < 3 && (
                    <div
                      className={`h-0.5 w-6 sm:w-10 transition ${
                        i < step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Close onboarding tour"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Shortlynk
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Shorten links, track click counts, and customize QR codes from a single dashboard.
            </p>
            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="font-semibold text-blue-600 dark:text-blue-400">1</span>
                <span>Paste long URLs with optional custom aliases.</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="font-semibold text-blue-600 dark:text-blue-400">2</span>
                <span>Monitor real-time click counts and link status.</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950">
                <span className="font-semibold text-blue-600 dark:text-blue-400">3</span>
                <span>Generate and download print-ready QR codes in QR Studio.</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Interactive Link Creation */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create Your First Link
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Paste a destination URL below to generate a short link immediately.
            </p>
            <div className="mt-4 flex gap-2 min-w-0">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                placeholder="example.com/destination"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
              />
              <button
                type="button"
                onClick={handleShorten}
                disabled={!inputUrl.trim() || createUrlMutation.isPending}
                className="h-11 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {createUrlMutation.isPending ? "Creating..." : "Shorten"}
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
            )}

            {createdSlug && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Link created successfully:</p>
                  <p className="font-mono mt-0.5 truncate">{fullShortUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: All Set */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              You're All Set
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your links, review click counts, or explore QR Code Studio from your dashboard.
            </p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-300 space-y-2">
              <p>💡 <strong>Tip:</strong> Toggle dark mode anytime using the theme switch in the top navigation.</p>
              <p>💡 <strong>Tip:</strong> You can restart this tour at any time from your Account Settings.</p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={onPrev}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={step === 3 ? onClose : onNext}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700 cursor-pointer"
            >
              {step === 3 ? "Finish & Go to Dashboard" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
