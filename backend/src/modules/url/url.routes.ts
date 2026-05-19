import { Router } from "express";

import * as urlController from "./url.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  protect,
  asyncHandler(urlController.createShortUrl)
);

export default router;