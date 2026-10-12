import { z } from "zod";

export const VALID_TIMEZONES = new Set([
  ...Intl.supportedValuesOf("timeZone"),
  "UTC",
]);

export const analyticsQuerySchema = z.object({
  days: z.coerce
    .number()
    .pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]))
    .default(7),
  tz: z
    .string()
    .default("UTC")
    .refine((val) => VALID_TIMEZONES.has(val), {
      message: "Invalid IANA timezone",
    }),
  includeBots: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
