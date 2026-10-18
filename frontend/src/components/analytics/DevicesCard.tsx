import type { DeviceItem } from "../../features/analytics/analytics.types";

export interface DevicesCardProps {
  devices?: DeviceItem[];
  isLoading?: boolean;
}

export function DevicesCard({ devices = [], isLoading = false }: DevicesCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-1.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Devices</h3>
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No device data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Devices</h3>
      <div className="space-y-3">
        {devices.map((d) => (
          <div key={d.type} className="text-xs">
            <div className="mb-1 flex justify-between font-medium">
              <span className="capitalize text-slate-800 dark:text-slate-200">{d.type}</span>
              <span className="shrink-0 text-slate-500 dark:text-slate-400">
                {d.clicks} ({d.percentage}%)
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(d.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
