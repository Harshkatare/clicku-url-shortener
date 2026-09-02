import { db } from "../../db/index.js";
import { urls } from "../../db/schema/urls.js";
import { users } from "../../db/schema/users.js";
import { sql } from "drizzle-orm";

interface PublicStats {
  totalUrls: number;
  totalClicks: number;
  totalUsers: number;
}

let cachedStats: PublicStats | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export async function getPublicStats(): Promise<PublicStats> {
  const now = Date.now();

  // Return cached telemetry if within 60s TTL
  if (cachedStats && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedStats;
  }

  // 1. Total URLs created
  const [urlCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(urls);

  // 2. Total Clicks redirected across all URLs
  const [clicksSumRes] = await db
    .select({ sum: sql<number>`coalesce(sum(${urls.clicks}), 0)::int` })
    .from(urls);

  // 3. Total Registered Users
  const [userCountRes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);

  cachedStats = {
    totalUrls: urlCountRes?.count ?? 0,
    totalClicks: clicksSumRes?.sum ?? 0,
    totalUsers: userCountRes?.count ?? 0,
  };
  lastFetchedAt = now;

  return cachedStats;
}