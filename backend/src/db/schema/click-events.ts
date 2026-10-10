import {
  boolean,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { urls } from "./urls.js";

export const clickEvents = pgTable(
  "click_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    urlId: uuid("url_id")
      .references(() => urls.id, {
        onDelete: "cascade",
      })
      .notNull(),

    clickedAt: timestamp("clicked_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    ipHash: varchar("ip_hash", {
      length: 64,
    }),

    country: varchar("country", {
      length: 2,
    }),

    city: varchar("city", {
      length: 100,
    }),

    isBot: boolean("is_bot")
      .default(false)
      .notNull(),

    deviceType: varchar("device_type", {
      length: 20,
    }),

    browser: varchar("browser", {
      length: 50,
    }),

    os: varchar("os", {
      length: 50,
    }),

    referrer: varchar("referrer", {
      length: 200,
    }),
  },
  (table) => [
    index("click_events_url_clicked_idx").on(table.urlId, table.clickedAt),
    index("click_events_clicked_at_idx").on(table.clickedAt),
  ]
);

export type ClickEvent = typeof clickEvents.$inferSelect;
export type NewClickEvent = typeof clickEvents.$inferInsert;
