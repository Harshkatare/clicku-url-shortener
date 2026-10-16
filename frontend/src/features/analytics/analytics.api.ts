import { api } from "../../api/client";
import type {
  AnalyticsQueryParams,
  UrlAnalyticsResponse,
  OverviewAnalyticsResponse,
  AdminStatsResponse,
} from "./analytics.types";

export async function getUrlAnalytics(
  urlId: string,
  params?: AnalyticsQueryParams
): Promise<UrlAnalyticsResponse> {
  const response = await api.get<UrlAnalyticsResponse>(
    `/urls/${urlId}/analytics`,
    { params }
  );
  return response.data;
}

export async function getOverviewAnalytics(
  params?: AnalyticsQueryParams
): Promise<OverviewAnalyticsResponse> {
  const response = await api.get<OverviewAnalyticsResponse>(
    "/analytics/overview",
    { params }
  );
  return response.data;
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  const response = await api.get<AdminStatsResponse>("/admin/stats");
  return response.data;
}
