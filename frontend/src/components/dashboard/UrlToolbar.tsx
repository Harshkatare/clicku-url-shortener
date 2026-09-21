import type { KeyboardEvent } from "react";
import type { UrlStatus } from "../../features/urls/urls.types";

export type UrlFilterStatus = UrlStatus | "pinned" | "all";

interface UrlToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: UrlFilterStatus;
  onStatusChange: (status: UrlFilterStatus) => void;
  sortBy: "createdAt" | "clicks";
  sortDir: "asc" | "desc";
  onSortChange: (sortBy: "createdAt" | "clicks", sortDir: "asc" | "desc") => void;
  isFetching?: boolean;
}

const SORT_OPTIONS: Array<{
  value: string;
  sortBy: "createdAt" | "clicks";
  sortDir: "asc" | "desc";
  label: string;
}> = [
  { value: "createdAt:desc", sortBy: "createdAt", sortDir: "desc", label: "Newest First" },
  { value: "createdAt:asc", sortBy: "createdAt", sortDir: "asc", label: "Oldest First" },
  { value: "clicks:desc", sortBy: "clicks", sortDir: "desc", label: "Most Clicks" },
  { value: "clicks:asc", sortBy: "clicks", sortDir: "asc", label: "Least Clicks" },
];

const STATUS_FILTERS: Array<{
  key: UrlFilterStatus;
  label: string;
  dotColor?: string;
}> = [
  { key: "all", label: "All Links" },
  { key: "pinned", label: "Pinned", dotColor: "bg-blue-500" },
  { key: "active", label: "Active", dotColor: "bg-emerald-500" },
  { key: "expiring", label: "Expiring", dotColor: "bg-amber-500" },
  { key: "archived", label: "Archived", dotColor: "bg-slate-400 dark:bg-slate-500" },
];

export function UrlToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  sortDir,
  onSortChange,
  isFetching = false,
}: UrlToolbarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onSearchChange("");
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input Bar */}
      <div className="relative w-full sm:max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <svg
            className={`h-4 w-4 transition-colors ${
              isFetching
                ? "animate-pulse text-blue-500"
                : "text-slate-400 dark:text-slate-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by destination, code, or alias..."
          className="w-full rounded-xl border border-slate-200/90 bg-white/90 py-2 pl-10 pr-9 text-sm text-slate-900 shadow-2xs backdrop-blur-md transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-blue-500/15 dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-400/20"
          aria-label="Search links"
        />

        {search.length > 0 && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Controls Container: Status Filter Chips & Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:justify-end">
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
          role="tablist"
          aria-label="Filter links by status"
        >
          {STATUS_FILTERS.map((item) => {
            const isSelected = status === item.key;

            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-pressed={isSelected}
                onClick={() => onStatusChange(item.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-600/20 dark:bg-blue-500 dark:text-white"
                    : "border border-slate-200/80 bg-white/80 text-slate-600 shadow-2xs backdrop-blur-md hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                {item.dotColor && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-white" : item.dotColor
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Sort Selector Dropdown */}
        <div className="relative inline-flex shrink-0 items-center">
          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const selected = SORT_OPTIONS.find((opt) => opt.value === e.target.value);
              if (selected) {
                onSortChange(selected.sortBy, selected.sortDir);
              }
            }}
            aria-label="Sort links by"
            className="cursor-pointer appearance-none rounded-xl border border-slate-200/80 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-hidden focus:ring-3 focus:ring-blue-500/15 dark:border-slate-800/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-700 dark:focus:border-blue-400"
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 dark:text-slate-500">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
