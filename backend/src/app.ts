import crypto from "crypto";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import urlRoutes from "./modules/url/url.routes.js";
import statsRoutes from "./modules/stats/stats.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiRateLimit } from "./lib/rate-limit/api-rate-limit.js"

import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { env } from "./config/env.js";


const app = express();

app.set("trust proxy", env.NODE_ENV === "production" ? 2 : 1);

app.use(helmet());

const allowedOrigins = [
  env.CLIENT_URL,
  "https://www.shortlynk.in",
  "https://shortlynk.in",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(requestIdMiddleware);

app.use(
  pinoHttp({
    logger,
    redact: ['req.headers["x-diag-token"]'],

    customProps(req) {
      return {
        requestId: req.requestId,
      };
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running",
  });
});

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running",
  });
});

app.get("/api/v1/auth/test-cookie", (req, res) => {
  const expected = env.DIAG_TOKEN;
  const supplied = req.headers["x-diag-token"];

  if (!expected || typeof supplied !== "string") {
    return res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }

  const expectedBuf = Buffer.from(expected, "utf8");
  const suppliedBuf = Buffer.from(supplied, "utf8");

  if (
    suppliedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(suppliedBuf, expectedBuf)
  ) {
    return res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  res.cookie("sl_diag_test", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 60_000,
  });

  return res.status(204).end();
});

app.use("/api", apiRateLimit);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/urls", urlRoutes);
app.use("/api/v1/stats", statsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.use("/", redirectRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;
