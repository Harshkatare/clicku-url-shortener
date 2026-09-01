import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import urlRoutes from "./modules/url/url.routes.js";
import redirectRoutes from "./routes/redirect.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { apiRateLimit } from "./lib/rate-limit/api-rate-limit.js"

import pinoHttp from "pino-http";
import { logger } from "./lib/logger.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { env } from "./config/env.js";


const app = express();

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(requestIdMiddleware);

app.use(
  pinoHttp({
    logger,

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

app.use("/api", apiRateLimit);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/urls", urlRoutes);

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
