import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum([
    "development", 
    "production",
    "test"
  ]),

  
  PORT: z.string(),

  DATABASE_URL: z.url(),

  JWT_SECRET: z
    .string()
    .min(10),

  CLIENT_URL: z.url(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  DIAG_TOKEN: z.string().min(16).optional(),
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
