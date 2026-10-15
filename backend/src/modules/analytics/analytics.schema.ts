import { z } from "zod";

export function isValidTimeZone(tz: string): boolean {
  if (!tz || typeof tz !== "string") {
    return false;
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const analyticsQuerySchema = z.object({
  days: z.coerce
    .number()
    .pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]))
    .default(7),
  tz: z
    .string()
    .default("UTC")
    .refine(isValidTimeZone, {
      message: "Invalid IANA timezone",
    }),
  includeBots: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
