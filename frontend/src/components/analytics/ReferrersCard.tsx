import type { ReferrerItem } from "../../features/analytics/analytics.types";

export interface ReferrersCardProps {
  referrers?: ReferrerItem[];
  isLoading?: boolean;
}

function getReferrerColor(source: string): string {
  const s = source.toLowerCase();
  if (s.includes("twitter") || s.includes("x.com") || s.includes("t.co")) return "bg-blue-400";
  if (s.includes("linkedin")) return "bg-sky-600";
  if (s.includes("github")) return "bg-slate-800 dark:bg-slate-200";
  if (s.includes("google")) return "bg-amber-500";
  if (s.includes("facebook") || s.includes("meta")) return "bg-blue-600";
  if (s.includes("direct")) return "bg-emerald-500";
  return "bg-indigo-500";
}

export function ReferrersCard({ referrers = [], isLoading = false }: ReferrersCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-1.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (referrers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Referrers</h3>
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No referrer data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Referrers</h3>
      <div className="space-y-3">
        {referrers.slice(0, 6).map((r) => (
          <div key={r.source} className="text-xs">
            <div className="mb-1 flex justify-between font-medium">
              <span className="truncate text-slate-800 dark:text-slate-200" title={r.source}>
                {r.source}
              </span>
              <span className="shrink-0 text-slate-500 dark:text-slate-400">
                {r.clicks} ({r.percentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getReferrerColor(r.source)}`}
                style={{ width: `${Math.min(r.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
