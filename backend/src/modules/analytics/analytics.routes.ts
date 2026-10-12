import { Router } from "express";
import * as analyticsController from "./analytics.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { protect } from "../../middleware/auth.middleware.js";
import { analyticsOverviewRateLimit } from "../../lib/rate-limit/analytics-rate-limit.js";

const router = Router();

router.get(
  "/overview",
  protect,
  analyticsOverviewRateLimit,
  asyncHandler(analyticsController.getOverviewAnalytics)
);

export default router;
