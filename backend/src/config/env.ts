import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum([
    "development", 
    "production"
  ]),

  
  PORT: z.string(),

  DATABASE_URL: z.url(),

  JWT_SECRET: z
    .string()
    .min(10),

  CLIENT_URL: z.url(),
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