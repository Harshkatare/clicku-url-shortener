import { useState, useRef, useEffect } from "react";
import type { Url, UrlStatus } from "../../features/urls/urls.types";
import { env } from "../../config/env";
import { copyToClipboard } from "../../utils/copy";
import { useToastContext } from "../../context/ToastContext";

export interface UrlCardProps {
  url: Url;
  onEdit: (url: Url) => void;
  onDelete: (url: Url) => void;
  onQrClick?: (url: Url) => void;
  onTogglePin?: (url: Url) => void;
}

/**
 * Deterministic Logarithmic Click Velocity calculation.
 * Translates heavy-tailed click distributions into smooth, visually distinct 0-100% engagement.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function calculateClickProgress(clicks: number): number {
  if (!clicks || clicks <= 0 || !Number.isFinite(clicks)) return 0;
  const BENCHMARK = 1000;
  const pct = (Math.log10(clicks + 1) / Math.log10(BENCHMARK + 1)) * 100;
  return Math.min(100, Math.max(2, Math.round(pct)));
}

function getClickGradient(clicks: number): string {
  if (clicks > 500) return "from-indigo-500 via-purple-500 to-pink-500";
  if (clicks > 100) return "from-blue-500 to-cyan-400";
  return "from-blue-600 to-indigo-500";
}

function getTrend(clicks: number): { label: string; dotColor: string } | null {
  if (clicks > 500) return { label: "Trending", dotColor: "bg-emerald-500" };
  if (clicks > 100) return { label: "Growing", dotColor: "bg-cyan-500" };
  return null;
}

const STATUS_CONFIG: Record<UrlStatus, { label: string; badgeClass: string }> = {
  active: {
    label: "Active",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 ring-1 ring-emerald-600/20",
  },
  expiring: {
    label: "Expiring",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 ring-1 ring-amber-600/20",
  },
  archived: {
    label: "Archived",
    badgeClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20",
  },
};

function formatDisplayDate(dateStr?: string): { formatted: string; full: string } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    formatted: `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} at ${d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`,
    full: d.toLocaleString(),
  };
}

export function UrlCard({ url, onEdit, onDelete, onQrClick, onTogglePin }: UrlCardProps) {
  const { showToast } = useToastContext();
  const [isCopied, setIsCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const displaySlug = url.customAlias || url.shortCode;
  const cleanBaseUrl = (env.SHORT_URL_BASE || "").replace(/\/+$/, "");
  const shortUrl = `${cleanBaseUrl}/${displaySlug}`;
  const displayHost = cleanBaseUrl.replace(/^https?:\/\//, "");
  const clickProgress = calculateClickProgress(url.clicks);
  const clickGradient = getClickGradient(url.clicks);
  const trend = getTrend(url.clicks);
  const statusInfo = STATUS_CONFIG[url.status] ?? STATUS_CONFIG.active;
  const createdDate = formatDisplayDate(url.createdAt);

  const handleCopy = async () => {
    try {
      const success = await copyToClipboard(shortUrl);
      if (success) {
        setIsCopied(true);
        showToast("info", "Link copied to clipboard!");

        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => {
          setIsCopied(false);
          copyTimeoutRef.current = null;
        }, 2000);
      } else {
        showToast("error", "Failed to copy URL.");
      }
    } catch {
      showToast("error", "Failed to copy URL.");
    }
  };

  return (
    <li className={`card-hover group rounded-2xl border p-5 shadow-xs backdrop-blur-xl transition-all duration-200 ${
      url.isPinned
        ? "border-blue-200/90 bg-blue-50/20 dark:border-blue-800/80 dark:bg-blue-950/20"
        : "border-slate-200/80 bg-white/85 dark:border-slate-800/80 dark:bg-slate-900/85"
    }`}>
      {/* Top Row: Short URL link, Vanity pill, Pinned badge, Status badge & Responsive Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center gap-1.5 break-all text-base sm:text-lg font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            title="Open short link in new tab"
          >
            <span>
              {displayHost}/
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {displaySlug}
              </span>
            </span>
            <svg
              className="h-4 w-4 shrink-0 opacity-60 transition group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:opacity-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          {url.customAlias && (
            <span
              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 ring-1 ring-inset ring-blue-700/10 select-none dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/20"
              title={`Fallback system code: ${url.shortCode}`}
            >
              vanity alias
            </span>
          )}

          {url.isPinned && (
            <span
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20 select-none dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-400/30"
              title="Pinned to top of dashboard"
            >
              <svg className="h-3 w-3 -rotate-45 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13.5v-3a2 2 0 00-2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3.5a2 2 0 00-2 2v3a1 1 0 001 1h5v6a1 1 0 002 0v-6h5a1 1 0 001-1z" />
              </svg>
              pinned
            </span>
          )}

          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold select-none ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Action buttons with responsive hover/focus-within disclosure and compliant touch targets */}
        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 shrink-0">
          {onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(url)}
              aria-label={url.isPinned ? `Unpin ${displaySlug}` : `Pin ${displaySlug} to top`}
              title={url.isPinned ? "Unpin link" : "Pin to top"}
              className={`inline-flex min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] items-center justify-center rounded-xl border transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                url.isPinned
                  ? "border-blue-300 bg-blue-50 text-blue-600 shadow-2xs dark:border-blue-700/60 dark:bg-blue-950/60 dark:text-blue-400"
                  : "border-slate-200/80 bg-slate-50/80 text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              }`}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-150 ${
                  url.isPinned ? "-rotate-45" : "hover:scale-110"
                }`}
                fill={url.isPinned ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 13.5v-3a2 2 0 00-2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3.5a2 2 0 00-2 2v3a1 1 0 001 1h5v6a1 1 0 002 0v-6h5a1 1 0 001-1z"
                />
              </svg>
            </button>
          )}
          {onQrClick && (
            <button
              type="button"
              onClick={() => onQrClick(url)}
              aria-label={`QR Studio for ${displaySlug}`}
              title="Generate QR Code"
              className="inline-flex min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900 cursor-pointer"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            aria-label={isCopied ? "Link copied to clipboard" : "Copy short link"}
            title={isCopied ? "Copied!" : "Copy link"}
            className="inline-flex min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900 cursor-pointer"
          >
            {isCopied ? (
              <svg
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => onEdit(url)}
            aria-label={`Edit short link ${displaySlug}`}
            title="Edit link"
            className="inline-flex min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white dark:focus-visible:ring-offset-slate-900 cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(url)}
            aria-label={`Delete short link ${displaySlug}`}
            title="Delete link"
            className="inline-flex min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 text-slate-600 shadow-2xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-red-900/40 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-offset-slate-900 cursor-pointer"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Middle Row: Destination URL */}
      <p className="mt-2.5 break-all text-sm text-slate-500 dark:text-slate-400">
        {url.originalUrl}
      </p>

      {/* Bottom Row: Click Engagement Velocity & Created Timestamp */}
      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800/60">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {url.clicks.toLocaleString()} {url.clicks === 1 ? "click" : "clicks"}
            </span>
            {trend && (
              <>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${trend.dotColor}`}
                    aria-hidden="true"
                  />
                  {trend.label}
                </span>
              </>
            )}
          </div>

          {createdDate && (
            <span
              className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"
              title={`Created: ${createdDate.full}`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{createdDate.formatted}</span>
            </span>
          )}
        </div>

        {/* W3C ARIA 1.2 Compliant Engagement Progress Bar */}
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={clickProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${url.clicks.toLocaleString()} clicks`}
          aria-label={`Click engagement for ${displaySlug}`}
        >
          <div
            className={`h-full rounded-full bg-gradient-to-r ${clickGradient} transition-all duration-500 ease-out`}
            style={{ width: `${clickProgress}%` }}
          />
        </div>
      </div>
    </li>
  );
}
