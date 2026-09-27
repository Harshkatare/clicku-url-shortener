import { Router } from "express";

import * as urlController from "../modules/url/url.controller.js";

import { asyncHandler } from "../utils/async-handler.js";
import { redirectRateLimit } from "../lib/rate-limit/redirect-rate-limit.js";

const router = Router();

router.get(
  "/:slug",
  redirectRateLimit,
  asyncHandler(
    urlController.redirectToOriginalUrl
  )
);

export default router;