import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { getUrls } from "../features/urls/urls.api";
import {
  useUrlAnalytics,
  useOverviewAnalytics,
} from "../features/analytics/analytics.hooks";
import type {
  AnalyticsDays,
  OverviewAnalyticsData,
  UrlAnalyticsData,
} from "../features/analytics/analytics.types";

import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { DailyClicksChart } from "../components/analytics/DailyClicksChart";
import { TopUrlsLeaderboard } from "../components/analytics/TopUrlsLeaderboard";
import { CountriesCard } from "../components/analytics/CountriesCard";
import { ReferrersCard } from "../components/analytics/ReferrersCard";
import { DevicesCard } from "../components/analytics/DevicesCard";
import { PeakHoursChart } from "../components/analytics/PeakHoursChart";

interface StatBoxProps {
  label: string;
  value: number;
  subtitle: string;
}

function StatBox({ label, value, subtitle }: StatBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
          {value.toLocaleString()}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function StatBoxSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-7 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-1 h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Scope filter state derived directly from searchParams (single source of truth)
  const selectedUrlId = searchParams.get("url") || "all";

  const rawDays = parseInt(searchParams.get("days") || "7", 10);
  const days: AnalyticsDays = rawDays === 30 || rawDays === 90 ? rawDays : 7;

  const includeBots = searchParams.get("bots") === "true";

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  // Update query params when filters change
  const handleSelectUrl = (id: string | "all") => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === "all") {
          next.delete("url");
        } else {
          next.set("url", id);
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleDaysChange = (newDays: AnalyticsDays) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newDays === 7) {
          next.delete("days");
        } else {
          next.set("days", String(newDays));
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleToggleBots = (bots: boolean) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!bots) {
          next.delete("bots");
        } else {
          next.set("bots", "true");
        }
        return next;
      },
      { replace: true }
    );
  };

  // Fetch user URLs for dropdown
  const { data: urlsData, isLoading: isLoadingUrls } = useQuery({
    queryKey: ["urls", "analytics-selector"],
    queryFn: () => getUrls({ limit: 100 }),
    staleTime: 30_000,
  });
  const userUrls = urlsData?.data ?? [];

  // Query overview or single URL
  const queryParams = { days, tz: timezone, includeBots };
  const isOverview = selectedUrlId === "all";

  const overviewQuery = useOverviewAnalytics(queryParams, {
    enabled: isOverview,
  });

  const urlQuery = useUrlAnalytics(selectedUrlId, queryParams, {
    enabled: !isOverview,
  });

  const activeQuery = isOverview ? overviewQuery : urlQuery;
  const rawData: OverviewAnalyticsData | UrlAnalyticsData | undefined =
    activeQuery.data?.data;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const refetch = activeQuery.refetch;

  // Selected URL object for pre-v0.8 notice
  const selectedUrlObj = useMemo(() => {
    if (selectedUrlId === "all") return null;
    return userUrls.find((u) => u.id === selectedUrlId) || null;
  }, [userUrls, selectedUrlId]);

  const showLegacyNotice = Boolean(
    !isLoading &&
      selectedUrlObj &&
      selectedUrlObj.clicks > 0 &&
      (rawData?.summary?.totalClicks ?? 0) === 0
  );

  const topUrls = useMemo(() => {
    if (isOverview && rawData && "topUrls" in rawData) {
      return (rawData as OverviewAnalyticsData).topUrls;
    }
    return [];
  }, [isOverview, rawData]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnalyticsHeader
          selectedUrlId={selectedUrlId}
          onSelectUrl={handleSelectUrl}
          days={days}
          onDaysChange={handleDaysChange}
          includeBots={includeBots}
          onIncludeBotsChange={handleToggleBots}
          timezone={timezone}
          urls={userUrls}
          isLoadingUrls={isLoadingUrls}
        />

        {/* Zero Links Empty State */}
        {!isLoadingUrls && userUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No links created yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Create your first short link on the dashboard to start tracking click telemetry.
            </p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* API Error State */}
            {isError && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                <span>Failed to load analytics data. Please check your connection and try again.</span>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="font-medium text-red-700 underline hover:text-red-800 dark:text-red-400"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Legacy pre-v0.8 notice */}
            {showLegacyNotice && selectedUrlObj && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                Detailed analytics tracking began in October 2026. This link recorded{" "}
                <span className="font-semibold">{selectedUrlObj.clicks.toLocaleString()}</span>{" "}
                {selectedUrlObj.clicks === 1 ? "click" : "clicks"} prior to event-level logging.
              </div>
            )}

            {/* 4 Summary Stat Boxes */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <StatBoxSkeleton key={i} />)
              ) : (
                <>
                  <StatBox
                    label="Total Clicks"
                    value={rawData?.summary?.totalClicks ?? 0}
                    subtitle="All recorded events"
                  />
                  <StatBox
                    label="Human Clicks"
                    value={rawData?.summary?.humanClicks ?? 0}
                    subtitle="Verified visitors"
                  />
                  <StatBox
                    label="Bot Clicks"
                    value={rawData?.summary?.botClicks ?? 0}
                    subtitle="Automated crawlers"
                  />
                  <StatBox
                    label="Unique Visitors"
                    value={rawData?.summary?.uniqueVisitors ?? 0}
                    subtitle="Daily distinct IPs"
                  />
                </>
              )}
            </div>

            {/* Charts Top Row: DailyClicksChart + TopUrlsLeaderboard */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className={isOverview ? "lg:col-span-2" : "lg:col-span-3"}>
                <DailyClicksChart
                  data={rawData?.dailyClicks}
                  days={days}
                  isLoading={isLoading}
                />
              </div>

              {isOverview && (
                <div className="lg:col-span-1">
                  <TopUrlsLeaderboard
                    urls={topUrls}
                    isLoading={isLoading}
                    onSelectUrl={handleSelectUrl}
                  />
                </div>
              )}
            </div>

            {/* Breakdown Cards Bottom Row: Countries, Referrers, Devices, PeakHours */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <CountriesCard
                countries={rawData?.countries}
                isLoading={isLoading}
              />
              <ReferrersCard
                referrers={rawData?.referrers}
                isLoading={isLoading}
              />
              <DevicesCard
                devices={rawData?.devices}
                isLoading={isLoading}
              />
              <PeakHoursChart
                peakHours={rawData?.peakHours}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
