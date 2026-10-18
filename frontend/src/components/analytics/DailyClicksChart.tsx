import { useId, useMemo, useState } from "react";
import type { DailyClickItem, AnalyticsDays } from "../../features/analytics/analytics.types";

export interface DailyClicksChartProps {
  data?: DailyClickItem[];
  days: AnalyticsDays;
  isLoading?: boolean;
}

function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month: (month || 1) - 1, day: day || 1 };
}

function formatDayName(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const d = new Date(year, month, day);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatShortDate(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const d = new Date(year, month, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const d = new Date(year, month, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DailyClicksChart({
  data = [],
  days,
  isLoading = false,
}: DailyClicksChartProps) {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize sparse SQL data into a continuous timeline of length `days`
  const timelineData = useMemo(() => {
    const clicksMap = new Map<string, number>();
    for (const item of data) {
      clicksMap.set(item.date, item.clicks);
    }

    const result: DailyClickItem[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      result.push({
        date: dateStr,
        clicks: clicksMap.get(dateStr) || 0,
      });
    }

    return result;
  }, [data, days]);

  const totalClicks = useMemo(
    () => timelineData.reduce((sum, item) => sum + item.clicks, 0),
    [timelineData]
  );

  const computedMax = useMemo(
    () => Math.max(...timelineData.map((d) => d.clicks), 0),
    [timelineData]
  );

  // Geometry for 640x220 viewBox
  const vbWidth = 640;
  const vbHeight = 220;
  const marginLeft = 44;
  const marginRight = 16;
  const marginTop = 20;
  const marginBottom = 36;
  const plotWidth = vbWidth - marginLeft - marginRight;
  const plotHeight = vbHeight - marginTop - marginBottom;

  const yMax = computedMax === 0 ? 5 : computedMax < 5 ? 5 : Math.ceil(computedMax * 1.15);
  const yTicks = [yMax, Math.round(yMax / 2), 0];

  const n = timelineData.length;
  const slotWidth = n > 0 ? plotWidth / n : plotWidth;
  const barWidth = Math.max(
    2,
    Math.min(slotWidth * 0.72, days === 7 ? 36 : days === 30 ? 12 : 4)
  );

  const hoveredItem = hoveredIndex !== null ? timelineData[hoveredIndex] : null;
  const hoverLeftPercent =
    hoveredIndex !== null && n > 0
      ? ((marginLeft + (hoveredIndex + 0.5) * slotWidth) / vbWidth) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex h-52 items-end justify-between gap-2 px-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="w-full animate-pulse rounded-t bg-slate-200 dark:bg-slate-800"
              style={{ height: `${25 + ((i * 12) % 65)}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (timelineData.length === 0 || totalClicks === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Daily Clicks</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click activity over time</p>
        </div>
        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
          <div className="mb-2 rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No clicks recorded yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Clicks will appear here once visitors start using your links
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Daily Clicks</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {days === 7 ? "Last 7 days" : days === 30 ? "Last 30 days" : "Last 90 days"} activity
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total: </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {totalClicks.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart Canvas & Tooltip Container */}
      <div className="relative w-full overflow-hidden">
        {/* Floating Tooltip */}
        {hoveredItem && (
          <div
            role="tooltip"
            aria-live="polite"
            className="pointer-events-none absolute top-1 z-10 rounded-lg border border-slate-800 bg-slate-900/95 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-xs transition-transform duration-75 dark:border-slate-700"
            style={{
              left: `${hoverLeftPercent}%`,
              transform:
                hoverLeftPercent < 15
                  ? "translateX(0%)"
                  : hoverLeftPercent > 85
                  ? "translateX(-100%)"
                  : "translateX(-50%)",
            }}
          >
            <div className="font-semibold text-blue-400">
              {hoveredItem.clicks.toLocaleString()} {hoveredItem.clicks === 1 ? "click" : "clicks"}
            </div>
            <div className="text-[11px] text-slate-300">{formatFullDate(hoveredItem.date)}</div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="h-48 w-full sm:h-56"
          role="img"
          aria-label="Daily clicks bar chart"
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

          {/* Y-axis Gridlines & Labels */}
          {yTicks.map((tick) => {
            const yPos = marginTop + plotHeight - (tick / yMax) * plotHeight;
            return (
              <g key={tick} className="select-none">
                <line
                  x1={marginLeft}
                  y1={yPos}
                  x2={marginLeft + plotWidth}
                  y2={yPos}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={marginLeft - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] dark:fill-slate-500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {timelineData.map((item, i) => {
            const barHeight = yMax > 0 ? (item.clicks / yMax) * plotHeight : 0;
            const barX = marginLeft + i * slotWidth + (slotWidth - barWidth) / 2;
            const barY = marginTop + (plotHeight - barHeight);
            const isHovered = hoveredIndex === i;

            return (
              <g key={item.date}>
                {/* Visual bar */}
                {item.clicks > 0 ? (
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={days === 90 ? 1 : 3}
                    fill={isHovered ? `url(#${gradientId}-hover)` : `url(#${gradientId})`}
                    className="transition-all duration-150"
                  />
                ) : (
                  /* Zero baseline tick */
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
                  x={marginLeft + i * slotWidth}
                  y={marginTop}
                  width={slotWidth}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* X-axis Labels */}
          {timelineData.map((item, i) => {
            let showLabel = false;
            if (days === 7) {
              showLabel = true;
            } else if (days === 30) {
              showLabel = i % 5 === 0 || i === n - 1;
            } else {
              showLabel = i % 15 === 0 || i === n - 1;
            }

            if (!showLabel) return null;

            const labelX = marginLeft + (i + 0.5) * slotWidth;
            const labelText = days === 7 ? formatDayName(item.date) : formatShortDate(item.date);

            return (
              <text
                key={`label-${item.date}`}
                x={labelX}
                y={marginTop + plotHeight + 18}
                textAnchor="middle"
                className="select-none fill-slate-400 text-[10px] dark:fill-slate-500"
              >
                {labelText}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
