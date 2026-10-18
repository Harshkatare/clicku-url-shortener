import type { AnalyticsDays } from "../../features/analytics/analytics.types";

export interface AnalyticsHeaderProps {
  selectedUrlId: string | "all";
  onSelectUrl: (id: string | "all") => void;
  days: AnalyticsDays;
  onDaysChange: (days: AnalyticsDays) => void;
  includeBots: boolean;
  onIncludeBotsChange: (includeBots: boolean) => void;
  timezone: string;
  urls: Array<{
    id: string;
    shortCode: string;
    customAlias?: string | null;
    originalUrl: string;
  }>;
  isLoadingUrls?: boolean;
}

const RANGE_OPTIONS: Array<{ value: AnalyticsDays; label: string }> = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

export function AnalyticsHeader({
  selectedUrlId,
  onSelectUrl,
  days,
  onDaysChange,
  includeBots,
  onIncludeBotsChange,
  timezone,
  urls,
  isLoadingUrls = false,
}: AnalyticsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title & Scope Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Click performance and traffic breakdown
          </p>
        </div>

        {/* Link Selector Dropdown */}
        <div className="sm:ml-4">
          <label htmlFor="analytics-url-scope" className="sr-only">
            Select link scope
          </label>
          <select
            id="analytics-url-scope"
            value={selectedUrlId}
            onChange={(e) => onSelectUrl(e.target.value as string | "all")}
            disabled={isLoadingUrls}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-64 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="all">All Links (Overview)</option>
            {urls.map((u) => {
              const slug = u.customAlias || u.shortCode;
              const rawUrl = u.originalUrl.replace(/^https?:\/\//, "");
              const cleanUrl = rawUrl.length > 38 ? `${rawUrl.slice(0, 35)}...` : rawUrl;
              return (
                <option key={u.id} value={u.id}>
                  {slug} — {cleanUrl}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Filters: Range, Bots & Timezone */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Timezone Badge */}
        <span
          title={`Click timestamps normalized to ${timezone}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          <svg
            className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="max-w-[120px] truncate">{timezone}</span>
        </span>

        {/* Bot Toggle */}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60">
          <input
            type="checkbox"
            checked={includeBots}
            onChange={(e) => onIncludeBotsChange(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <span>Include bots</span>
        </label>

        {/* Date Range Selector */}
        <div
          role="group"
          aria-label="Date range"
          className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {RANGE_OPTIONS.map((opt) => {
            const isActive = days === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onDaysChange(opt.value)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
