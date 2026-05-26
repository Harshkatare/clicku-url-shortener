import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.string(),

  DATABASE_URL: z.url(),

  JWT_SECRET: z
    .string()
    .min(10),
});

const parsedEnv =
  envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables"
  );

  console.error(
    z.treeifyError(parsedEnv.error)
  );

  process.exit(1);
}

export const env = parsedEnv.data;