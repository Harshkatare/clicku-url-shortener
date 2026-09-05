import { Router } from "express";

import * as urlController from "./url.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { protect } from "../../middleware/auth.middleware.js";

import { demoRateLimit } from "../../lib/rate-limit/demo-rate-limit.js";

const router = Router();

router.post(
  "/demo",
  demoRateLimit,
  asyncHandler(urlController.createDemoUrl)
);

router.post(
  "/claim",
  protect,
  asyncHandler(urlController.claimUrl)
);

router.get(
  "/",
  protect,
  asyncHandler(urlController.getUserUrls)
);

router.post(
  "/",
  protect,
  asyncHandler(urlController.createShortUrl)
);

router.delete(
  "/:id",
  protect,
  asyncHandler(urlController.deleteUrl)
);

router.patch(
  "/:id",
  protect,
  asyncHandler(urlController.updateUrl)
);

export default router;