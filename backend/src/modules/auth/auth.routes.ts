import { Router } from "express";

import * as authController from "./auth.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { protect } from "../../middleware/auth.middleware.js";

import { authRateLimit } from "../../lib/rate-limit/auth-rate-limit.js"

const router = Router();

router.use(authRateLimit);

router.post(
  "/signup",
  asyncHandler(authController.signup)
);

router.post(
  "/login",
  asyncHandler(authController.login)
);

router.get(
  "/me",
  protect,
  asyncHandler(authController.me)
);

export default router;