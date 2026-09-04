import type { ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface TechnicalMetric {
  value: string;
  label: string;
  subtext: string;
  specPill: string;
  tagStyle: string;
  icon: ReactNode;
}

const METRICS: TechnicalMetric[] = [
  {
    value: "56.8B+",
    label: "Unlimited-Scale Links",
    subtext: "56.8B+ possible 6-character combinations, ready for massive-scale link generation.",
    specPill: "62⁶ Base62",
    tagStyle:
      "bg-blue-50 text-blue-700 border-blue-200/70 hover:border-blue-300 hover:shadow-sm hover:shadow-blue-500/25 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50 dark:hover:border-blue-600 dark:hover:shadow-blue-400/20",
    icon: (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    value: "< 15ms",
    label: "Sub-15ms Redirects",
    subtext: "Lightning-fast edge routing sends every visitor straight to the destination.",
    specPill: "Edge 302 Tunnel",
    tagStyle:
      "bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:border-emerald-300 hover:shadow-sm hover:shadow-emerald-500/25 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 dark:hover:border-emerald-600 dark:hover:shadow-emerald-400/20",
    icon: (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    value: "100%",
    label: "Precision Analytics",
    subtext: "Atomic SQL telemetry keeps click data accurate and consistent at scale.",
    specPill: "PostgreSQL Atomic",
    tagStyle:
      "bg-purple-50 text-purple-700 border-purple-200/70 hover:border-purple-300 hover:shadow-sm hover:shadow-purple-500/25 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50 dark:hover:border-purple-600 dark:hover:shadow-purple-400/20",
    icon: (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    value: "Zero",
    label: "Zero Ads & Popups",
    subtext: "No ads, countdowns, interstitials, or distractions between the click and destination.",
    specPill: "100% Direct",
    tagStyle:
      "bg-amber-50 text-amber-700 border-amber-200/70 hover:border-amber-300 hover:shadow-sm hover:shadow-amber-500/25 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50 dark:hover:border-amber-600 dark:hover:shadow-amber-400/20",
    icon: (
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    ),
  },
];

export function TechnicalMetricsStrip() {
  const ref = useScrollReveal<HTMLElement>(0.05);

  return (
    <section
      ref={ref}
      className="relative border-y border-slate-200/80 bg-white/70 py-10 backdrop-blur-md transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-900/50 sm:py-12"
    >
      {/* Subtle atmospheric ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-24 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-y-8 divide-y divide-slate-200/70 md:grid-cols-4 md:gap-y-0 md:divide-y-0 md:divide-x md:divide-slate-200/70 dark:divide-slate-800/80">
          {METRICS.map((metric, i) => (
            <div
              key={metric.label}
              className={`flex flex-col items-center text-center px-4 transition-all duration-200 ${
                i >= 2 ? "pt-8 md:pt-0" : ""
              }`}
            >
              {/* Engineering spec badge with micro-lift and subtle glow on hover */}
              <span
                className={`group/badge inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 cursor-default select-none ${metric.tagStyle}`}
              >
                <span className="transition-transform duration-200 ease-out group-hover/badge:scale-115">
                  {metric.icon}
                </span>
                <span>{metric.specPill}</span>
              </span>

              {/* Metric Hero Value */}
              <p className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                <span className="gradient-primary">{metric.value}</span>
              </p>

              {/* Consumer & Marketer Headline */}
              <h3 className="mt-1.5 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                {metric.label}
              </h3>

              {/* One-liner explanatory subtext */}
              <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
