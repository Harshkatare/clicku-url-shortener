import rateLimit from "express-rate-limit";

export const authRateLimit =
  rateLimit({
    windowMs: 15 * 60 * 1000,

    max: 10,

    message: {
      success: false,
      message:
        "Too many auth requests. Please try again later.",
    },

    standardHeaders: true,

    legacyHeaders: false,
  });