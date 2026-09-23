import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/index.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected error on idle PostgreSQL client");
});

export const db = drizzle(pool, {
  schema,
});