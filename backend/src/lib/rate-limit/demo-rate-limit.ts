import rateLimit from "express-rate-limit";

export const demoRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 3,
  message: {
    success: false,
    message:
      "Demo link limit reached (3 per day). Please sign up for a free account to create unlimited links!",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
