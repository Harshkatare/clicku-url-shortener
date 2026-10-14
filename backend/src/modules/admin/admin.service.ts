import { sql } from "drizzle-orm";
import { db, pool } from "../../db/index.js";
import { urls } from "../../db/schema/urls.js";
import { users } from "../../db/schema/users.js";

export interface AdminPlatformStats {
  platform: {
    totalUsers: number;
    totalUrls: number;
    totalClicks: number;
    activeUsers30d: number;
  };
  health: {
    dbPoolTotal: number;
    dbPoolIdle: number;
    dbPoolWaiting: number;
    uptimeSeconds: number;
  };
}

/**
 * Aggregates system-wide platform statistics and connection pool health.
 * Strictly zero PII: returns only primitive numeric platform and pool metrics.
 */
export async function getAdminPlatformStats(): Promise<AdminPlatformStats> {
  const [
    [userCountRes],
    [urlCountRes],
    [clicksSumRes],
    [activeUsers30dRes],
  ] = await Promise.all([
    // 1. Total registered users
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(users),

    // 2. Total shortened URLs
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(urls),

    // 3. Total clicks accumulated across all URLs
    db
      .select({ sum: sql<number>`coalesce(sum(${urls.clicks}), 0)::int` })
      .from(urls),

    // 4. Active users in last 30 days (active accounts created <= 30d or with URLs created <= 30d)
    db
      .select({
        count: sql<number>`count(distinct ${users.id})::int`,
      })
      .from(users)
      .where(
        sql`${users.isActive} = true and (
          ${users.createdAt} >= now() - interval '30 days'
          or exists (
            select 1 from urls
            where urls.user_id = ${users.id}
            and urls.created_at >= now() - interval '30 days'
          )
        )`
      ),
  ]);

  return {
    platform: {
      totalUsers: userCountRes?.count ?? 0,
      totalUrls: urlCountRes?.count ?? 0,
      totalClicks: clicksSumRes?.sum ?? 0,
      activeUsers30d: activeUsers30dRes?.count ?? 0,
    },
    health: {
      dbPoolTotal: pool.totalCount,
      dbPoolIdle: pool.idleCount,
      dbPoolWaiting: pool.waitingCount,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  };
}
