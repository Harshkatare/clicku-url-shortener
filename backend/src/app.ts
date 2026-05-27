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


const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use(requestIdMiddleware);

app.use(
  pinoHttp({
    logger,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running",
  });
});

app.use("/api", apiRateLimit);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/urls", urlRoutes);
app.use("/", redirectRoutes);

app.use(errorMiddleware);

export default app;
