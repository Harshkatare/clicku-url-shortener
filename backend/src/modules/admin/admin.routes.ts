import { Router } from "express";
import * as adminController from "./admin.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { protect } from "../../middleware/auth.middleware.js";
import { adminGuard } from "../../middleware/admin.middleware.js";
import { adminStatsRateLimit } from "../../lib/rate-limit/analytics-rate-limit.js";

const router = Router();

router.get(
  "/stats",
  protect,
  adminGuard,
  adminStatsRateLimit,
  asyncHandler(adminController.getAdminStats)
);

export default router;
