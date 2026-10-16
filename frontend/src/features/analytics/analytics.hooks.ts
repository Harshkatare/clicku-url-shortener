import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  getUrlAnalytics,
  getOverviewAnalytics,
  getAdminStats,
} from "./analytics.api";
import type {
  AnalyticsQueryParams,
  UrlAnalyticsResponse,
  OverviewAnalyticsResponse,
  AdminStatsResponse,
  AnalyticsErrorResponse,
} from "./analytics.types";

export const analyticsKeys = {
  all: ["analytics"] as const,
  url: (urlId: string, params?: AnalyticsQueryParams) =>
    [
      "analytics",
      urlId,
      {
        days: params?.days,
        tz: params?.tz,
        includeBots: params?.includeBots,
      },
    ] as const,
  overview: (params?: AnalyticsQueryParams) =>
    [
      "analytics",
      "overview",
      {
        days: params?.days,
        tz: params?.tz,
        includeBots: params?.includeBots,
      },
    ] as const,
  admin: () => ["admin", "stats"] as const,
};

export function useUrlAnalytics(
  urlId: string,
  params?: AnalyticsQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<UrlAnalyticsResponse, AxiosError<AnalyticsErrorResponse>>({
    queryKey: analyticsKeys.url(urlId, params),
    queryFn: () => getUrlAnalytics(urlId, params),
    staleTime: 30_000,
    enabled: Boolean(urlId) && urlId !== "all" && (options?.enabled ?? true),
  });
}

export function useOverviewAnalytics(
  params?: AnalyticsQueryParams,
  options?: { enabled?: boolean }
) {
  return useQuery<OverviewAnalyticsResponse, AxiosError<AnalyticsErrorResponse>>({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => getOverviewAnalytics(params),
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery<AdminStatsResponse, AxiosError<AnalyticsErrorResponse>>({
    queryKey: analyticsKeys.admin(),
    queryFn: getAdminStats,
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}
