import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { clickEvents } from "../../db/schema/click-events.js";
import { logger } from "../logger.js";

export const ROLLUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DEFAULT_OLDER_THAN_DAYS = 90;
export const DEFAULT_BATCH_SIZE = 1000;

let lastRollupAt: number | null = null;
let isRunning = false;

export interface RollupOptions {
  olderThanDays?: number;
  batchSize?: number;
  force?: boolean;
}

export interface RollupResult {
  rolledUpRows: number;
  deletedRows: number;
  skipped: boolean;
  durationMs: number;
}

/**
 * Executes the 90-day retention rollup worker:
 * 1. Aggregates click events older than olderThanDays (is_bot = false) into daily_url_stats.
 * 2. Purges all processed click events older than olderThanDays in batches to keep transactions short.
 * 3. Enforces concurrency protection via the isRunning lock.
 */
export async function runRollup(options: RollupOptions = {}): Promise<RollupResult> {
  const {
    olderThanDays = DEFAULT_OLDER_THAN_DAYS,
    batchSize = DEFAULT_BATCH_SIZE,
    force = false,
  } = options;

  if (isRunning) {
    logger.info("Rollup worker is already running. Skipping concurrent trigger.");
    return { rolledUpRows: 0, deletedRows: 0, skipped: true, durationMs: 0 };
  }

  if (!force && lastRollupAt !== null && Date.now() - lastRollupAt < ROLLUP_INTERVAL_MS) {
    return { rolledUpRows: 0, deletedRows: 0, skipped: true, durationMs: 0 };
  }

  isRunning = true;
  const start = Date.now();

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Check if any events qualify for rollup
      const [countRow] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(clickEvents)
        .where(sql`${clickEvents.clickedAt} < NOW() - (${olderThanDays} * INTERVAL '1 day')`);

      const eligibleCount = countRow?.count ?? 0;
      if (eligibleCount === 0) {
        return { rolledUpRows: 0, deletedRows: 0, skipped: false };
      }

      // 2. Aggregate old events into daily_url_stats via CTE upsert
      const upsertRes = await tx.execute(sql`
        WITH batch_events AS (
          SELECT *
          FROM click_events
          WHERE clicked_at < NOW() - (${olderThanDays} * INTERVAL '1 day')
        ),
        countries_agg AS (
          SELECT
            url_id,
            event_date,
            jsonb_object_agg(COALESCE(country, 'Unknown'), cnt) AS countries
          FROM (
            SELECT
              url_id,
              DATE(clicked_at AT TIME ZONE 'UTC') AS event_date,
              country,
              COUNT(*)::int AS cnt
            FROM batch_events
            WHERE is_bot = false
            GROUP BY url_id, DATE(clicked_at AT TIME ZONE 'UTC'), country
          ) sub
          GROUP BY url_id, event_date
        ),
        devices_agg AS (
          SELECT
            url_id,
            event_date,
            jsonb_object_agg(COALESCE(device_type, 'Unknown'), cnt) AS devices
          FROM (
            SELECT
              url_id,
              DATE(clicked_at AT TIME ZONE 'UTC') AS event_date,
              device_type,
              COUNT(*)::int AS cnt
            FROM batch_events
            WHERE is_bot = false
            GROUP BY url_id, DATE(clicked_at AT TIME ZONE 'UTC'), device_type
          ) sub
          GROUP BY url_id, event_date
        ),
        referrers_agg AS (
          SELECT
            url_id,
            event_date,
            jsonb_object_agg(COALESCE(referrer, 'Direct'), cnt) AS referrers
          FROM (
            SELECT
              url_id,
              DATE(clicked_at AT TIME ZONE 'UTC') AS event_date,
              referrer,
              COUNT(*)::int AS cnt
            FROM batch_events
            WHERE is_bot = false
            GROUP BY url_id, DATE(clicked_at AT TIME ZONE 'UTC'), referrer
          ) sub
          GROUP BY url_id, event_date
        ),
        peak_hours_agg AS (
          SELECT
            url_id,
            event_date,
            jsonb_object_agg(hour::text, cnt) AS peak_hours
          FROM (
            SELECT
              url_id,
              DATE(clicked_at AT TIME ZONE 'UTC') AS event_date,
              EXTRACT(HOUR FROM clicked_at AT TIME ZONE 'UTC')::int AS hour,
              COUNT(*)::int AS cnt
            FROM batch_events
            WHERE is_bot = false
            GROUP BY url_id, DATE(clicked_at AT TIME ZONE 'UTC'), EXTRACT(HOUR FROM clicked_at AT TIME ZONE 'UTC')::int
          ) sub
          GROUP BY url_id, event_date
        ),
        base_agg AS (
          SELECT
            url_id,
            DATE(clicked_at AT TIME ZONE 'UTC') AS event_date,
            COUNT(*)::int AS total_clicks,
            COUNT(DISTINCT ip_hash)::int AS unique_visitors
          FROM batch_events
          WHERE is_bot = false
          GROUP BY url_id, DATE(clicked_at AT TIME ZONE 'UTC')
        )
        INSERT INTO daily_url_stats (url_id, date, total_clicks, unique_visitors, metadata)
        SELECT
          b.url_id,
          b.event_date,
          b.total_clicks,
          b.unique_visitors,
          jsonb_strip_nulls(
            jsonb_build_object(
              'countries', c.countries,
              'devices', d.devices,
              'referrers', r.referrers,
              'peak_hours', p.peak_hours
            )
          ) AS metadata
        FROM base_agg b
        LEFT JOIN countries_agg c ON b.url_id = c.url_id AND b.event_date = c.event_date
        LEFT JOIN devices_agg d ON b.url_id = d.url_id AND b.event_date = d.event_date
        LEFT JOIN referrers_agg r ON b.url_id = r.url_id AND b.event_date = r.event_date
        LEFT JOIN peak_hours_agg p ON b.url_id = p.url_id AND b.event_date = p.event_date
        ON CONFLICT (url_id, date) DO UPDATE SET
          total_clicks = daily_url_stats.total_clicks + EXCLUDED.total_clicks,
          unique_visitors = GREATEST(daily_url_stats.unique_visitors, EXCLUDED.unique_visitors),
          metadata = COALESCE(daily_url_stats.metadata, '{}'::jsonb) || EXCLUDED.metadata
      `);

      const rolledUpRows = upsertRes.rowCount ?? 0;

      // 3. Purge rolled-up events in batches
      let deletedRows = 0;
      while (true) {
        const deleteRes = await tx.execute(sql`
          DELETE FROM click_events
          WHERE id IN (
            SELECT id FROM click_events
            WHERE clicked_at < NOW() - (${olderThanDays} * INTERVAL '1 day')
            LIMIT ${batchSize}
          )
        `);

        const batchDeleted = deleteRes.rowCount ?? 0;
        deletedRows += batchDeleted;

        if (batchDeleted < batchSize) {
          break;
        }
      }

      return { rolledUpRows, deletedRows, skipped: false };
    });

    lastRollupAt = Date.now();
    const durationMs = Date.now() - start;

    logger.info(
      { rolledUpRows: result.rolledUpRows, deletedRows: result.deletedRows, durationMs },
      "Telemetry 90-day retention rollup completed"
    );

    return { ...result, durationMs };
  } catch (err) {
    logger.error({ err }, "Telemetry 90-day retention rollup failed");
    throw err;
  } finally {
    isRunning = false;
  }
}

/**
 * Triggers the rollup worker lazily if 24 hours have elapsed since the last run.
 * Non-blocking, un-awaited invocation from analytics request handlers.
 */
export async function runRollupIfNeeded(): Promise<RollupResult | null> {
  if (isRunning) {
    return null;
  }

  if (lastRollupAt !== null && Date.now() - lastRollupAt < ROLLUP_INTERVAL_MS) {
    return null;
  }

  return runRollup();
}

/**
 * Returns current lock status of the rollup worker.
 */
export function getIsRollupRunning(): boolean {
  return isRunning;
}

/**
 * Returns timestamp of last completed rollup.
 */
export function getLastRollupAt(): number | null {
  return lastRollupAt;
}

/**
 * Resets worker lock and timestamp for test isolation.
 */
export function resetRollupStateForTest(): void {
  isRunning = false;
  lastRollupAt = null;
}

/**
 * Overrides lastRollupAt timestamp for testing intervals.
 */
export function setLastRollupAtForTest(timestamp: number | null): void {
  lastRollupAt = timestamp;
}
