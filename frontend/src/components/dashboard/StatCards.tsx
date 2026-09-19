import type { ReactNode } from "react";
import type { UserUrlStats } from "../../features/urls/urls.types";
import { useAnimateCounter } from "../../hooks/useAnimateCounter";

interface StatCardsProps {
  stats?: UserUrlStats;
  isLoading?: boolean;
}

interface SingleStatCardProps {
  label: string;
  displayValue: ReactNode;
  subtitle: string;
  subtitleColorClass?: string;
  icon: ReactNode;
  iconBgClass: string;
}

function SingleStatCard({
  label,
  displayValue,
  subtitle,
  subtitleColorClass = "text-slate-500 dark:text-slate-400",
  icon,
  iconBgClass,
}: SingleStatCardProps) {
  return (
    <div className="glass card-hover relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-xs backdrop-blur-xl transition-all duration-200 dark:border-slate-800/80 dark:bg-slate-900/75">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconBgClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-slate-100">
          {displayValue}
        </p>
        <p className={`mt-1 text-xs font-medium ${subtitleColorClass}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3.5 w-20 rounded-md" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="mt-4">
        <div className="skeleton h-8 w-24 rounded-lg" />
        <div className="skeleton mt-2 h-3.5 w-32 rounded-md" />
      </div>
    </div>
  );
}

const DEFAULT_EMPTY_STATS: UserUrlStats = {
  totalUrls: 0,
  totalClicks: 0,
  activeLinks: 0,
  expiringLinks: 0,
  archivedLinks: 0,
  avgClicksPerLink: 0,
};

export function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  const activeStats = stats ?? DEFAULT_EMPTY_STATS;

  const animatedUrls = useAnimateCounter(activeStats.totalUrls);
  const animatedClicks = useAnimateCounter(activeStats.totalClicks);
  const animatedActive = useAnimateCounter(activeStats.activeLinks);
  const animatedCtrTenths = useAnimateCounter(
    Math.round((activeStats.avgClicksPerLink || 0) * 10)
  );

  const expiringCount = activeStats.expiringLinks;
  const archivedCount = activeStats.archivedLinks;

  const activeSubtitle =
    expiringCount > 0
      ? `${expiringCount} expiring soon`
      : archivedCount > 0
      ? `${archivedCount} archived`
      : "100% active operational";

  const activeColorClass =
    expiringCount > 0
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  const formattedVelocity =
    activeStats.totalUrls === 0 ? "0.0" : (animatedCtrTenths / 10).toFixed(1);

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total URLs */}
      <SingleStatCard
        label="Total URLs"
        displayValue={animatedUrls.toLocaleString()}
        subtitle="Portfolio scale"
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        }
        iconBgClass="bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
      />

      {/* 2. Total Clicks */}
      <SingleStatCard
        label="Total Clicks"
        displayValue={animatedClicks.toLocaleString()}
        subtitle="Cumulative engagements"
        subtitleColorClass="text-purple-600 dark:text-purple-400"
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        }
        iconBgClass="bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30"
      />

      {/* 3. Active Links */}
      <SingleStatCard
        label="Active Links"
        displayValue={animatedActive.toLocaleString()}
        subtitle={activeSubtitle}
        subtitleColorClass={activeColorClass}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconBgClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
      />

      {/* 4. Avg Velocity */}
      <SingleStatCard
        label="Avg. Velocity"
        displayValue={formattedVelocity}
        subtitle="Clicks per link"
        subtitleColorClass="text-amber-600 dark:text-amber-400"
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        iconBgClass="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30"
      />
    </div>
  );
}
