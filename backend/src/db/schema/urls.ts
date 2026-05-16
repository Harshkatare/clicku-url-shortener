import {
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users.js";
  
  export const urls = pgTable("urls", {
    id: uuid("id").primaryKey(),
  
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
  
    shortCode: varchar("short_code", {
      length: 10,
    })
      .notNull()
      .unique(),
  
    originalUrl: text("original_url")
      .notNull(),
  
    clicks: integer("clicks")
      .default(0)
      .notNull(),
  
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  });