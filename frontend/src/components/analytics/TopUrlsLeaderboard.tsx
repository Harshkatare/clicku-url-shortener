import { env } from "../../config/env";
import type { TopUrlItem } from "../../features/analytics/analytics.types";

export interface TopUrlsLeaderboardProps {
  urls?: TopUrlItem[];
  isLoading?: boolean;
  onSelectUrl?: (urlId: string) => void;
}

export function TopUrlsLeaderboard({
  urls = [],
  isLoading = false,
  onSelectUrl,
}: TopUrlsLeaderboardProps) {
  const cleanBaseUrl = (env.SHORT_URL_BASE || "").replace(/\/+$/, "");
  const displayHost = cleanBaseUrl.replace(/^https?:\/\//, "");

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-1 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top URLs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Highest volume shortlinks</p>
        </div>
        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No link activity yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Top performing links will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Top URLs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Highest volume shortlinks</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Top {Math.min(urls.length, 5)}
        </span>
      </div>

      <div className="space-y-2">
        {urls.slice(0, 5).map((u, i) => {
          const slug = u.customAlias || u.shortCode;
          const rawDest = u.originalUrl.replace(/^https?:\/\//, "");
          const cleanDest = rawDest.length > 36 ? `${rawDest.slice(0, 33)}...` : rawDest;
          const isClickable = Boolean(onSelectUrl);

          const content = (
            <>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  i === 0
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : i === 1
                    ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    : i === 2
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  <span className="text-slate-500 dark:text-slate-400">{displayHost}/</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{slug}</span>
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400" title={u.originalUrl}>
                  {cleanDest}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  {u.clicks.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                  {u.clicks === 1 ? "click" : "clicks"}
                </span>
              </div>
            </>
          );

          if (isClickable) {
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelectUrl?.(u.id)}
                title={`View analytics for ${slug}`}
                className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={u.id} className="flex items-center gap-3 p-2">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
