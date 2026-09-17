import type { Toast } from "../../types/toast.types";

const icons: Record<string, React.ReactNode> = {
  success: (
    <svg
      className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg
      className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg
      className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const colorStyles: Record<string, string> = {
  success:
    "border-emerald-300/60 bg-emerald-50/80 text-emerald-950 shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-slate-900/85 dark:text-emerald-300 dark:shadow-emerald-950/30",
  error:
    "border-red-300/60 bg-red-50/80 text-red-950 shadow-red-500/10 dark:border-red-500/30 dark:bg-slate-900/85 dark:text-red-300 dark:shadow-red-950/30",
  info:
    "border-blue-300/60 bg-blue-50/80 text-blue-950 shadow-blue-500/10 dark:border-blue-500/30 dark:bg-slate-900/85 dark:text-blue-300 dark:shadow-blue-950/30",
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="pointer-events-none fixed top-20 right-4 sm:right-6 z-[100] flex max-w-sm flex-col gap-2.5"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={`toast-anim pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl transition-all ${
            colorStyles[t.type] || colorStyles.info
          }`}
        >
          {icons[t.type] || icons.info}
          <span className="flex-1 text-xs sm:text-sm font-medium leading-tight">{t.message}</span>
          {t.undoAction && (
            <button
              type="button"
              onClick={() => {
                t.undoAction?.();
                onRemove(t.id);
              }}
              className="ml-1 shrink-0 rounded-md bg-white/70 px-2.5 py-1 text-xs font-bold text-slate-800 underline decoration-slate-400 underline-offset-2 shadow-xs transition hover:bg-white hover:text-slate-950 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(t.id)}
            className="ml-1 shrink-0 rounded-md p-1 text-slate-400 hover:bg-black/5 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200 focus:outline-hidden"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </aside>
  );
}
