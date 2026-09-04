import type { ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

interface Feature {
  icon: ReactNode;
  title: string;
  desc: string;
  tags: string[];
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  decorBg: string;
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    title: "Custom Branded Links",
    desc: "Replace long, messy URLs with clean, memorable custom aliases. Perfect for social bios, campaigns, and personal branding.",
    tags: ["Custom Slugs", "Branded Links", "1-Click Copy"],
    iconColor: "text-blue-700 dark:text-blue-300",
    iconBg: "bg-blue-50/80 dark:bg-blue-950/50",
    iconBorder: "border-blue-200/70 dark:border-blue-800/50",
    decorBg: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <rect x="3" y="3" width="6" height="6" rx="1.5" />
        <rect x="5" y="5" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="15" y="3" width="6" height="6" rx="1.5" />
        <rect x="17" y="5" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="3" y="15" width="6" height="6" rx="1.5" />
        <rect x="5" y="17" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="15" y="15" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="19" y="15" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="15" y="19" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="19" y="19" width="2" height="2" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Vector QR Code Studio",
    desc: "Generate crisp, high-resolution vector QR codes ready for print packaging, business cards, flyers, and mobile scanning.",
    tags: ["Vector SVG", "High-Res PNG", "Print-Ready"],
    iconColor: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-50/80 dark:bg-emerald-950/50",
    iconBorder: "border-emerald-200/70 dark:border-emerald-800/50",
    decorBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Deep Audience Analytics",
    desc: "Understand your traffic with click volume tracking, referrer sources, device breakdowns, and geographic insights.",
    tags: ["Referrers", "Device Telemetry", "Geographics"],
    iconColor: "text-purple-700 dark:text-purple-300",
    iconBg: "bg-purple-50/80 dark:bg-purple-950/50",
    iconBorder: "border-purple-200/70 dark:border-purple-800/50",
    decorBg: "bg-purple-500/10 dark:bg-purple-400/10",
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
      >
        <path d="M9 17H7A5 5 0 0 1 7 7h2" />
        <path d="M15 7h2a5 5 0 0 1 4 8" />
        <line x1="8" y1="12" x2="12" y2="12" />
        <path d="M14 19l6-6 2 2-6 6h-2v-2z" />
      </svg>
    ),
    title: "Dynamic Link Editing",
    desc: "Modify destination URLs on the fly without breaking your existing short links or having to reprint QR codes.",
    tags: ["Editable Targets", "Zero Link Breakage", "Instant Update"],
    iconColor: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-50/80 dark:bg-amber-950/50",
    iconBorder: "border-amber-200/70 dark:border-amber-800/50",
    decorBg: "bg-amber-500/10 dark:bg-amber-400/10",
  },
];

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const ref = useScrollReveal<HTMLDivElement>(index * 0.08);

  return (
    <div
      ref={ref}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      className="card-hover group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-800/60 dark:hover:border-slate-700 dark:hover:shadow-slate-950/50"
    >
      {/* Decorative Glow Blob */}
      <div
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-125 ${feature.decorBg}`}
      />

      <div>
        {/* Crisp Scaled Icon Box */}
        <div
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
          className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-110 ${feature.iconBg} ${feature.iconBorder} ${feature.iconColor}`}
        >
          {feature.icon}
        </div>

        {/* Feature Title */}
        <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors dark:text-white">
          {feature.title}
        </h3>

        {/* Feature Description */}
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {feature.desc}
        </p>
      </div>

      {/* Feature Tags */}
      <div className="mt-6 flex flex-wrap gap-1.5 text-xs">
        {feature.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-slate-200/60 bg-slate-100/80 px-2.5 py-1 font-medium text-slate-600 transition-colors dark:border-slate-700/60 dark:bg-slate-700/50 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  const headerRef = useScrollReveal<HTMLDivElement>(0);

  return (
    <section id="features" className="relative pt-24 pb-14 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mx-auto mb-16 max-w-3xl text-center sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse-soft" />
            Core Capabilities
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Engineered for speed,{" "}
            <span className="gradient-primary">built for reliability</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Everything you need to create, share, and track shortened URLs with
            complete confidence.
          </p>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
