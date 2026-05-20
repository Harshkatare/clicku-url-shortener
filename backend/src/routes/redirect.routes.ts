import { Router } from "express";

import * as urlController from "../modules/url/url.controller.js";

import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get(
  "/:shortCode",
  asyncHandler(
    urlController.redirectToOriginalUrl
  )
);

export default router;