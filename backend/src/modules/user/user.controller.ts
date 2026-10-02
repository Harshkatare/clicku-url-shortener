import { Request, Response } from "express";

import {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} from "./user.schema.js";
import * as userService from "./user.service.js";

export async function updateProfile(req: Request, res: Response) {
  const validatedData = updateProfileSchema.parse(req.body);
  const updatedUser = await userService.updateProfile(req.user!.id, validatedData);

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
}

export async function changePassword(req: Request, res: Response) {
  const validatedData = changePasswordSchema.parse(req.body);
  const result = await userService.changePassword(req.user!.id, validatedData);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function deleteAccount(req: Request, res: Response) {
  const validatedData = deleteAccountSchema.parse(req.body);
  const result = await userService.deleteAccount(req.user!.id, validatedData);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function exportUserData(req: Request, res: Response) {
  const data = await userService.exportUserData(req.user!.id);

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="shortlynk-data-export.json"'
  );
  res.setHeader("Content-Type", "application/json");

  res.status(200).json(data);
}
