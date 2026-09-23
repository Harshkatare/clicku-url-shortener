import { Router } from "express";

import * as authController from "./auth.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { protect } from "../../middleware/auth.middleware.js";

import { authRateLimit } from "../../lib/rate-limit/auth-rate-limit.js"

const router = Router();

// Credential mutation routes - strictly protected against brute-force attacks (10 req / 15m)
router.post(
  "/signup",
  authRateLimit,
  asyncHandler(authController.signup)
);

router.post(
  "/login",
  authRateLimit,
  asyncHandler(authController.login)
);

// Session profile retrieval - authenticated via JWT and protected by global apiRateLimit (100 req / 15m)
router.get(
  "/me",
  protect,
  asyncHandler(authController.me)
);

export default router;