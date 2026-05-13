import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "server is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use(errorMiddleware);

export default app;
