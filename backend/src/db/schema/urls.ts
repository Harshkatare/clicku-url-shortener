import {
    boolean,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users.js";
  
  export const urls = pgTable(
    "urls",
    {
      id: uuid("id").primaryKey(),
    
      userId: uuid("user_id")
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
    
      customAlias: varchar("custom_alias", {
        length: 50,
      }).unique(),
  
      status: varchar("status", {
        length: 20,
      })
        .default("active")
        .notNull(),
  
      isPinned: boolean("is_pinned")
        .default(false)
        .notNull(),
  
      sortOrder: integer("sort_order")
        .default(0)
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
    },
    (table) => [
      index("urls_user_pinned_idx").on(table.userId, table.isPinned),
    ]
  );