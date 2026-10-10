import {
  date,
  integer,
  jsonb,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { urls } from "./urls.js";

export const dailyUrlStats = pgTable(
  "daily_url_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    urlId: uuid("url_id")
      .references(() => urls.id, {
        onDelete: "cascade",
      })
      .notNull(),

    date: date("date")
      .notNull(),

    totalClicks: integer("total_clicks")
      .default(0)
      .notNull(),

    uniqueVisitors: integer("unique_visitors")
      .default(0)
      .notNull(),

    metadata: jsonb("metadata").$type<DailyStatsMetadata>(),
  },
  (table) => [
    uniqueIndex("daily_url_stats_url_date_idx").on(table.urlId, table.date),
  ]
);

export interface DailyStatsMetadata {
  countries?: Record<string, number>;
  referrers?: Record<string, number>;
  devices?: Record<string, number>;
  peak_hours?: Record<string, number>;
}

export type DailyUrlStat = typeof dailyUrlStats.$inferSelect;
export type NewDailyUrlStat = typeof dailyUrlStats.$inferInsert;
