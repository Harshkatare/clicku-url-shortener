import { useId, useMemo, useState } from "react";

export interface PeakHoursChartProps {
  peakHours?: number[];
  isLoading?: boolean;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour.toString().padStart(2, "0")}:00 (${displayHour} ${period})`;
}

export function PeakHoursChart({ peakHours = [], isLoading = false }: PeakHoursChartProps) {
  const gradientId = useId();
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Ensure 24-hour array length
  const normalizedHours = useMemo(() => {
    const arr = new Array(24).fill(0);
    for (let i = 0; i < Math.min(peakHours.length, 24); i++) {
      arr[i] = peakHours[i] || 0;
    }
    return arr;
  }, [peakHours]);

  const totalClicks = useMemo(
    () => normalizedHours.reduce((sum, val) => sum + val, 0),
    [normalizedHours]
  );

  const maxVal = useMemo(
    () => Math.max(...normalizedHours, 0),
    [normalizedHours]
  );

  const vbWidth = 320;
  const vbHeight = 110;
  const marginLeft = 8;
  const marginRight = 8;
  const marginTop = 12;
  const marginBottom = 24;
  const plotWidth = vbWidth - marginLeft - marginRight;
  const plotHeight = vbHeight - marginTop - marginBottom;

  const yMax = maxVal === 0 ? 1 : maxVal;
  const slotWidth = plotWidth / 24;
  const barWidth = Math.max(2, slotWidth * 0.75);

  const hoveredClicks = hoveredHour !== null ? normalizedHours[hoveredHour] : null;
  const hoverLeftPercent =
    hoveredHour !== null ? ((marginLeft + (hoveredHour + 0.5) * slotWidth) / vbWidth) * 100 : 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 flex h-32 items-end justify-between gap-0.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-full animate-pulse rounded-t bg-slate-200 dark:bg-slate-800"
              style={{ height: `${15 + ((i * 17) % 70)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (totalClicks === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Peak Hours</h3>
        <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No peak hour data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Peak Hours</h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">24h distribution</span>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Tooltip */}
        {hoveredHour !== null && hoveredClicks !== null && (
          <div
            role="tooltip"
            aria-live="polite"
            className="pointer-events-none absolute -top-1 z-10 rounded-md border border-slate-800 bg-slate-900/95 px-2 py-1 text-[11px] text-white shadow-md backdrop-blur-xs transition-transform duration-75 dark:border-slate-700"
            style={{
              left: `${hoverLeftPercent}%`,
              transform:
                hoverLeftPercent < 20
                  ? "translateX(0%)"
                  : hoverLeftPercent > 80
                  ? "translateX(-100%)"
                  : "translateX(-50%)",
            }}
          >
            <span className="font-semibold text-blue-400">
              {hoveredClicks} {hoveredClicks === 1 ? "click" : "clicks"}
            </span>
            <span className="block text-[10px] text-slate-400">{formatHour(hoveredHour)}</span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="h-32 w-full"
          role="img"
          aria-label="Peak hours histogram"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id={`${gradientId}-hover`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* Histogram Bars */}
          {normalizedHours.map((clicks, hour) => {
            const barHeight = yMax > 0 ? (clicks / yMax) * plotHeight : 0;
            const barX = marginLeft + hour * slotWidth + (slotWidth - barWidth) / 2;
            const barY = marginTop + (plotHeight - barHeight);
            const isHovered = hoveredHour === hour;

            return (
              <g key={hour}>
                {clicks > 0 ? (
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={1.5}
                    fill={isHovered ? `url(#${gradientId}-hover)` : `url(#${gradientId})`}
                    className="transition-all duration-150"
                  />
                ) : (
                  <rect
                    x={barX}
                    y={marginTop + plotHeight - 1}
                    width={barWidth}
                    height={1}
                    className="fill-slate-200 dark:fill-slate-800"
                  />
                )}

                {/* Hit target for hover capture */}
                <rect
                  x={marginLeft + hour * slotWidth}
                  y={marginTop}
                  width={slotWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                />
              </g>
            );
          })}

          {/* X-axis Markers: 0, 6, 12, 18, 23 */}
          {[0, 6, 12, 18, 23].map((h) => {
            const x = marginLeft + (h + 0.5) * slotWidth;
            return (
              <text
                key={h}
                x={x}
                y={marginTop + plotHeight + 14}
                textAnchor="middle"
                className="select-none fill-slate-400 text-[9px] dark:fill-slate-500"
              >
                {h}h
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
