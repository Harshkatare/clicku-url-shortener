import { Router } from "express";

import { protect } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  changePasswordRateLimit,
  deleteAccountRateLimit,
} from "../../lib/rate-limit/user-rate-limit.js";
import * as userController from "./user.controller.js";

const router = Router();

router.use(protect);

router.patch("/me", asyncHandler(userController.updateProfile));
router.post(
  "/me/change-password",
  changePasswordRateLimit,
  asyncHandler(userController.changePassword)
);
router.delete(
  "/me",
  deleteAccountRateLimit,
  asyncHandler(userController.deleteAccount)
);
router.get("/me/export", asyncHandler(userController.exportUserData));

export default router;
