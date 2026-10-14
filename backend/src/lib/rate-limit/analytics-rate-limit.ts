import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

export const analyticsUrlRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many analytics requests. Please try again later.",
  },
});

export const analyticsOverviewRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many analytics requests. Please try again later.",
  },
});

export const adminStatsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many admin requests. Please try again later.",
  },
});

