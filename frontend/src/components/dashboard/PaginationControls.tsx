interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  isPlaceholderData?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  isPlaceholderData = false,
}: PaginationControlsProps) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : Math.min((currentPage - 1) * limit + 1, totalItems);
  const endItem = Math.min(currentPage * limit, totalItems);

  const canGoPrevious = currentPage > 1 && !isPlaceholderData;
  const canGoNext = currentPage < totalPages && !isPlaceholderData;

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-4 text-xs sm:flex-row sm:text-sm text-slate-500 dark:border-slate-800/80 dark:text-slate-400 transition-opacity">
      {/* Items Range Readout */}
      <div>
        Showing{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {totalItems}
        </span>{" "}
        links
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200/90 disabled:hover:bg-white/90 dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 dark:disabled:hover:bg-slate-900/90 cursor-pointer"
          aria-label="Go to previous page"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="px-2 font-medium text-slate-600 dark:text-slate-400 select-none">
          Page{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {Math.max(totalPages, 1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200/90 disabled:hover:bg-white/90 dark:border-slate-800/90 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 dark:disabled:hover:bg-slate-900/90 cursor-pointer"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
