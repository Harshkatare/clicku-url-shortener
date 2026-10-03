import { useState } from "react";
import { exportUserData } from "../../features/user/user.api";
import { useToastContext } from "../../context/ToastContext";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function DangerZoneCard() {
  const { showToast } = useToastContext();
  const [isExporting, setIsExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportUserData();
      showToast("success", "Data export downloaded");
    } catch {
      showToast("error", "Failed to download data export");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-red-200/80 bg-red-50/20 p-6 shadow-xs dark:border-red-950/60 dark:bg-red-950/10 transition-colors">
      <div className="mb-5">
        <h2 className="text-base font-bold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Export your personal data or permanently remove your account.
        </p>
      </div>

      <div className="divide-y divide-red-200/60 dark:divide-red-950/40">
        {/* Data Export Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Export Account Data
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Download a complete JSON export of your profile and shortened links.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{isExporting ? "Exporting..." : "Download JSON"}</span>
          </button>
        </div>

        {/* Delete Account Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
              Delete Account
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Permanently delete your account and all associated URLs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
