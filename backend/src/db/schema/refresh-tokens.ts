import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    tokenHash: text("token_hash").notNull().unique(),

    familyId: uuid("family_id").notNull(),

    replacedBy: uuid("replaced_by"),

    deviceType: varchar("device_type", { length: 20 }),

    browser: varchar("browser", { length: 50 }),

    os: varchar("os", { length: 50 }),

    ipHash: varchar("ip_hash", { length: 64 }),

    location: varchar("location", { length: 100 }),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("refresh_tokens_user_idx").on(table.userId),
    index("refresh_tokens_family_idx").on(table.familyId),
    index("refresh_tokens_expires_idx").on(table.expiresAt),
  ]
);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
