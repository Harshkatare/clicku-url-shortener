export type AnalyticsDays = 7 | 30 | 90;

export type AnalyticsQueryParams = {
  days?: AnalyticsDays;
  tz?: string;
  includeBots?: boolean;
};

export type AnalyticsSummary = {
  totalClicks: number;
  humanClicks: number;
  botClicks: number;
  uniqueVisitors: number;
};

export type DailyClickItem = {
  date: string;
  clicks: number;
};

export type CountryItem = {
  code: string;
  name: string;
  clicks: number;
  percentage: number;
};

export type ReferrerItem = {
  source: string;
  clicks: number;
  percentage: number;
};

export type DeviceItem = {
  type: string;
  clicks: number;
  percentage: number;
};

export type TopUrlItem = {
  id: string;
  shortCode: string;
  customAlias: string | null;
  originalUrl: string;
  clicks: number;
};

export type UrlAnalyticsData = {
  summary: AnalyticsSummary;
  dailyClicks: DailyClickItem[];
  countries: CountryItem[];
  referrers: ReferrerItem[];
  devices: DeviceItem[];
  peakHours: number[];
};

export type OverviewAnalyticsData = UrlAnalyticsData & {
  topUrls: TopUrlItem[];
};

export type UrlAnalyticsResponse = {
  success: boolean;
  data: UrlAnalyticsData;
};

export type OverviewAnalyticsResponse = {
  success: boolean;
  data: OverviewAnalyticsData;
};

export type AdminPlatformStats = {
  totalUsers: number;
  totalUrls: number;
  totalClicks: number;
  activeUsers30d: number;
};

export type AdminHealthStats = {
  dbPoolTotal: number;
  dbPoolIdle: number;
  dbPoolWaiting: number;
  uptimeSeconds: number;
};

export type AdminStatsData = {
  platform: AdminPlatformStats;
  health: AdminHealthStats;
};

export type AdminStatsResponse = {
  success: boolean;
  data: AdminStatsData;
};

export type AnalyticsErrorResponse = {
  success: false;
  message: string;
};
