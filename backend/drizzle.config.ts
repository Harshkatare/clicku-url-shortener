import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

const envFile =
  process.env.DOTENV_CONFIG_PATH ||
  (process.env.NODE_ENV === "production" ? ".env.production" : ".env");
dotenv.config({ path: envFile });

export default defineConfig({
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
