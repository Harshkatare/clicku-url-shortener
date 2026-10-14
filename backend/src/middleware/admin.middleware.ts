import type { Request, Response, NextFunction } from "express";
import { AppError } from "../lib/errors/AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Ensures authenticated user has admin privileges.
 * Non-admin requests receive HTTP 403 Forbidden with standard error envelope.
 */
export function adminGuard(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    throw new ForbiddenError("Forbidden");
  }
  next();
}
