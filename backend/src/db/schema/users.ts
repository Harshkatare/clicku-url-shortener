import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  passwordHash: text("password_hash"),

  role: varchar("role", { length: 10 }).default("user").notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  googleId: text("google_id").unique(),

  avatarUrl: text("avatar_url"),

  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),

  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),

  lockedUntil: timestamp("locked_until", { withTimezone: true }),

  sessionsInvalidatedAt: timestamp("sessions_invalidated_at", { withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
