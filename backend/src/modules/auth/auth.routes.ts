import { Router } from "express";

import * as authController from "./auth.controller.js";

import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.post(
  "/signup",
  asyncHandler(authController.signup)
);

export default router;