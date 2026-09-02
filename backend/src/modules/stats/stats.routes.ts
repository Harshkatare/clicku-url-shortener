import { Router } from "express";
import * as statsController from "./stats.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.get(
  "/public",
  asyncHandler(statsController.getPublicStats)
);

export default router;
