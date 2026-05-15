import { Router } from "express";

import * as authController from "./auth.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = Router();

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