import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";

export const redirectRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  handler: (req, res) => {
    const isBrowser = req.headers.accept?.includes("text/html");

    if (isBrowser) {
      res
        .status(429)
        .type("text/plain")
        .send("Too many redirect requests. Please wait a moment and try again.");
      return;
    }

    res.status(429).json({
      success: false,
      message: "Too many redirect requests. Please try again later.",
    });
  },
});
