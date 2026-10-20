import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { getMe } from "../features/auth/auth.api";
import { useAdminStats } from "../features/analytics/analytics.hooks";

function formatUptime(uptimeSeconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(uptimeSeconds || 0));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days}d ${hours}h ${minutes}m`;
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle: string;
}

function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-7 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function HealthCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <div className="h-5 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-3.5 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-6 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-1 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-1 h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

function AdminHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Admin Dashboard
          </h1>
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/50 dark:text-purple-300">
            Administrator
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Platform telemetry and infrastructure health
        </p>
      </div>
    </div>
  );
}

function AdminHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: meData, isLoading: isLoadingMe } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });

  const isAdmin = meData?.data?.role === "admin";

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    isError,
    error,
    refetch,
  } = useAdminStats({ enabled: isAdmin });

  // While checking role, render header and card skeletons
  if (isLoadingMe) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <AdminHeaderSkeleton />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <HealthCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  // Once loaded, redirect non-admin users to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If server returns 403 Forbidden, redirect to dashboard
  if (isError && (error?.response?.status === 403 || error?.status === 403)) {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = statsData?.data;
  const showSkeletons = isLoadingStats || (isFetchingStats && !stats);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminHeader />

        {/* General Error Alert */}
        {isError && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            <span>
              {error?.response?.data?.message ||
                "Failed to load platform stats. Please check your connection and try again."}
            </span>
            <button
              type="button"
              disabled={isFetchingStats}
              onClick={() => void refetch()}
              className="font-medium text-red-700 underline hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 cursor-pointer ml-4 shrink-0"
            >
              {isFetchingStats ? "Retrying..." : "Retry"}
            </button>
          </div>
        )}

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {showSkeletons ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))
          ) : stats ? (
            <>
              <MetricCard
                label="Total Users"
                value={(stats.platform.totalUsers ?? 0).toLocaleString()}
                subtitle="Registered accounts"
              />
              <MetricCard
                label="Total URLs"
                value={(stats.platform.totalUrls ?? 0).toLocaleString()}
                subtitle="Shortlinks created"
              />
              <MetricCard
                label="Total Clicks"
                value={(stats.platform.totalClicks ?? 0).toLocaleString()}
                subtitle="Lifetime redirects"
              />
              <MetricCard
                label="Active Users (30d)"
                value={(stats.platform.activeUsers30d ?? 0).toLocaleString()}
                subtitle="Activity in last 30 days"
              />
            </>
          ) : null}
        </div>

        {/* Infrastructure Health Card */}
        {showSkeletons ? (
          <HealthCardSkeleton />
        ) : stats ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Infrastructure Health
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Database connection pool and server uptime
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DB Pool Card */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  DB Pool
                </span>
                <div className="mt-2">
                  <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
                    {stats.health.dbPoolIdle ?? 0} / {stats.health.dbPoolTotal ?? 0} idle
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {stats.health.dbPoolWaiting ?? 0} queries waiting
                  </p>
                </div>
              </div>

              {/* Uptime Card */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Uptime
                </span>
                <div className="mt-2">
                  <p className="text-xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
                    {formatUptime(stats.health.uptimeSeconds)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Server uptime
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
