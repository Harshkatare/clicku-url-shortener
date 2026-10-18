import { useMemo } from "react";
import type { CountryItem } from "../../features/analytics/analytics.types";

export interface CountriesCardProps {
  countries?: CountryItem[];
  isLoading?: boolean;
}

function resolveCountryName(code: string, name?: string, displayNames?: Intl.DisplayNames | null): string {
  if (name) return name;
  if (!code || code === "Unknown") return "Unknown";
  try {
    return displayNames?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

export function CountriesCard({ countries = [], isLoading = false }: CountriesCardProps) {
  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      return null;
    }
  }, []);

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

  if (countries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Countries</h3>
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No country data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Countries</h3>
      <div className="space-y-3">
        {countries.slice(0, 6).map((c) => {
          const resolvedName = resolveCountryName(c.code, c.name, displayNames);
          return (
            <div key={c.code} className="text-xs">
              <div className="mb-1 flex justify-between font-medium">
                <span className="truncate text-slate-800 dark:text-slate-200" title={resolvedName}>
                  {resolvedName}
                </span>
                <span className="shrink-0 text-slate-500 dark:text-slate-400">
                  {c.clicks} ({c.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${Math.min(c.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
