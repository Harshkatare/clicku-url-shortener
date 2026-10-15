import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { clickEvents } from "../../db/schema/click-events.js";
import { urls } from "../../db/schema/urls.js";
import { BadRequestError, NotFoundError } from "../../lib/errors/index.js";
import { logger } from "../../lib/logger.js";
import { runRollupIfNeeded } from "../../lib/telemetry/rollup-worker.js";
import { AnalyticsQueryInput, VALID_TIMEZONES } from "./analytics.schema.js";

export interface AnalyticsSummary {
  totalClicks: number;
  humanClicks: number;
  botClicks: number;
  uniqueVisitors: number;
}

export interface DailyClickItem {
  date: string;
  clicks: number;
}

export interface CountryItem {
  code: string;
  name: string;
  clicks: number;
  percentage: number;
}

export interface ReferrerItem {
  source: string;
  clicks: number;
  percentage: number;
}

export interface DeviceItem {
  type: string;
  clicks: number;
  percentage: number;
}

export interface TopUrlItem {
  id: string;
  shortCode: string;
  customAlias: string | null;
  originalUrl: string;
  clicks: number;
}

export interface UrlAnalyticsResponse {
  summary: AnalyticsSummary;
  dailyClicks: DailyClickItem[];
  countries: CountryItem[];
  referrers: ReferrerItem[];
  devices: DeviceItem[];
  peakHours: number[];
}

export interface OverviewAnalyticsResponse extends UrlAnalyticsResponse {
  topUrls: TopUrlItem[];
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function getCountryName(code: string | null): string {
  if (!code || code === "Unknown") {
    return "Unknown";
  }
  try {
    return regionNames.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

/**
 * Aggregates analytics for a specific URL owned by the authenticated user.
 * Foreign or non-existent URLs return 404 to avoid leaking existence.
 */
export async function getUrlAnalytics(
  urlId: string,
  userId: string,
  query: AnalyticsQueryInput
): Promise<UrlAnalyticsResponse> {
  const { days, tz, includeBots } = query;

  if (!VALID_TIMEZONES.has(tz)) {
    throw new BadRequestError("Invalid IANA timezone");
  }

  // Trigger lazy 90-day retention rollup check (non-blocking)
  runRollupIfNeeded().catch((err) => {
    logger.error({ err }, "Lazy rollup trigger failed in getUrlAnalytics");
  });

  const safeTz = tz;

  // 1. Ownership check: verify URL belongs to userId (404 not 403 on foreign/missing URLs)
  const [targetUrl] = await db
    .select({ id: urls.id })
    .from(urls)
    .where(and(eq(urls.id, urlId), eq(urls.userId, userId)));

  if (!targetUrl) {
    throw new NotFoundError("URL not found");
  }

  const timeCondition = sql`${clickEvents.clickedAt} >= NOW() - (${days} * INTERVAL '1 day')`;
  const botCondition = includeBots ? sql`TRUE` : eq(clickEvents.isBot, false);
  const tenantCondition = and(
    eq(urls.id, urlId),
    eq(urls.userId, userId),
    timeCondition
  );

  // 2. Parallel aggregation queries
  const [
    [summaryRow],
    dailyClicksRows,
    countryRows,
    referrerRows,
    deviceRows,
    peakHourRows,
  ] = await Promise.all([
    db
      .select({
        totalClicks: sql<number>`count(*)::int`,
        humanClicks: sql<number>`count(*) filter (where ${clickEvents.isBot} = false)::int`,
        botClicks: sql<number>`count(*) filter (where ${clickEvents.isBot} = true)::int`,
        uniqueVisitors: sql<number>`count(distinct case when ${includeBots ? sql`true` : sql`${clickEvents.isBot} = false`} then ${clickEvents.ipHash} end)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(tenantCondition),

    db
      .select({
        date: sql<string>`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(sql`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`),

    db
      .select({
        country: clickEvents.country,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.country)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        referrer: clickEvents.referrer,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        deviceType: clickEvents.deviceType,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.deviceType)
      .orderBy(desc(sql`count(*)`)),

    db
      .select({
        hour: sql<number>`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(sql`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`)
      .orderBy(sql`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`),
  ]);

  const summary: AnalyticsSummary = {
    totalClicks: summaryRow?.totalClicks ?? 0,
    humanClicks: summaryRow?.humanClicks ?? 0,
    botClicks: summaryRow?.botClicks ?? 0,
    uniqueVisitors: summaryRow?.uniqueVisitors ?? 0,
  };

  const baseClicks = includeBots ? summary.totalClicks : summary.humanClicks;

  const countries: CountryItem[] = countryRows.map((row) => ({
    code: row.country || "Unknown",
    name: getCountryName(row.country),
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const referrers: ReferrerItem[] = referrerRows.map((row) => ({
    source: row.referrer || "Direct",
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const devices: DeviceItem[] = deviceRows.map((row) => ({
    type: row.deviceType || "Desktop",
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const peakHours = new Array<number>(24).fill(0);
  for (const row of peakHourRows) {
    if (row.hour >= 0 && row.hour < 24) {
      peakHours[row.hour] = row.clicks;
    }
  }

  const dailyClicks: DailyClickItem[] = dailyClicksRows.map((row) => ({
    date: row.date,
    clicks: row.clicks,
  }));

  return {
    summary,
    dailyClicks,
    countries,
    referrers,
    devices,
    peakHours,
  };
}

/**
 * Aggregates analytics across all URLs owned by the authenticated user.
 */
export async function getOverviewAnalytics(
  userId: string,
  query: AnalyticsQueryInput
): Promise<OverviewAnalyticsResponse> {
  const { days, tz, includeBots } = query;

  if (!VALID_TIMEZONES.has(tz)) {
    throw new BadRequestError("Invalid IANA timezone");
  }

  // Trigger lazy 90-day retention rollup check (non-blocking)
  runRollupIfNeeded().catch((err) => {
    logger.error({ err }, "Lazy rollup trigger failed in getOverviewAnalytics");
  });

  const safeTz = tz;
  const timeCondition = sql`${clickEvents.clickedAt} >= NOW() - (${days} * INTERVAL '1 day')`;
  const botCondition = includeBots ? sql`TRUE` : eq(clickEvents.isBot, false);
  const tenantCondition = and(
    eq(urls.userId, userId),
    timeCondition
  );

  const [
    [summaryRow],
    dailyClicksRows,
    countryRows,
    referrerRows,
    deviceRows,
    peakHourRows,
    topUrlRows,
  ] = await Promise.all([
    db
      .select({
        totalClicks: sql<number>`count(*)::int`,
        humanClicks: sql<number>`count(*) filter (where ${clickEvents.isBot} = false)::int`,
        botClicks: sql<number>`count(*) filter (where ${clickEvents.isBot} = true)::int`,
        uniqueVisitors: sql<number>`count(distinct case when ${includeBots ? sql`true` : sql`${clickEvents.isBot} = false`} then ${clickEvents.ipHash} end)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(tenantCondition),

    db
      .select({
        date: sql<string>`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(sql`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${clickEvents.clickedAt} AT TIME ZONE ${safeTz}, 'YYYY-MM-DD')`),

    db
      .select({
        country: clickEvents.country,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.country)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        referrer: clickEvents.referrer,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        deviceType: clickEvents.deviceType,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(clickEvents.deviceType)
      .orderBy(desc(sql`count(*)`)),

    db
      .select({
        hour: sql<number>`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`,
        clicks: sql<number>`count(*)::int`,
      })
      .from(clickEvents)
      .innerJoin(urls, eq(clickEvents.urlId, urls.id))
      .where(and(tenantCondition, botCondition))
      .groupBy(sql`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`)
      .orderBy(sql`extract(hour from ${clickEvents.clickedAt} AT TIME ZONE ${safeTz})::int`),

    db
      .select({
        id: urls.id,
        shortCode: urls.shortCode,
        customAlias: urls.customAlias,
        originalUrl: urls.originalUrl,
        clicks: sql<number>`count(${clickEvents.id})::int`,
      })
      .from(urls)
      .innerJoin(clickEvents, eq(urls.id, clickEvents.urlId))
      .where(and(eq(urls.userId, userId), timeCondition, botCondition))
      .groupBy(urls.id, urls.shortCode, urls.customAlias, urls.originalUrl)
      .orderBy(desc(sql`count(${clickEvents.id})`))
      .limit(5),
  ]);

  const summary: AnalyticsSummary = {
    totalClicks: summaryRow?.totalClicks ?? 0,
    humanClicks: summaryRow?.humanClicks ?? 0,
    botClicks: summaryRow?.botClicks ?? 0,
    uniqueVisitors: summaryRow?.uniqueVisitors ?? 0,
  };

  const baseClicks = includeBots ? summary.totalClicks : summary.humanClicks;

  const countries: CountryItem[] = countryRows.map((row) => ({
    code: row.country || "Unknown",
    name: getCountryName(row.country),
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const referrers: ReferrerItem[] = referrerRows.map((row) => ({
    source: row.referrer || "Direct",
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const devices: DeviceItem[] = deviceRows.map((row) => ({
    type: row.deviceType || "Desktop",
    clicks: row.clicks,
    percentage: baseClicks > 0 ? Number(((row.clicks / baseClicks) * 100).toFixed(1)) : 0,
  }));

  const peakHours = new Array<number>(24).fill(0);
  for (const row of peakHourRows) {
    if (row.hour >= 0 && row.hour < 24) {
      peakHours[row.hour] = row.clicks;
    }
  }

  const dailyClicks: DailyClickItem[] = dailyClicksRows.map((row) => ({
    date: row.date,
    clicks: row.clicks,
  }));

  const topUrls: TopUrlItem[] = topUrlRows.map((row) => ({
    id: row.id,
    shortCode: row.shortCode,
    customAlias: row.customAlias,
    originalUrl: row.originalUrl,
    clicks: row.clicks,
  }));

  return {
    summary,
    dailyClicks,
    countries,
    referrers,
    devices,
    peakHours,
    topUrls,
  };
}
