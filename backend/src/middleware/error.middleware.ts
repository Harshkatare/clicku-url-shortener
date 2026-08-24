import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";

import { AppError } from "../lib/errors/AppError.js";

import { logger } from "../lib/logger.js"; 

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: error.issues[0]?.message,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  logger.error({ err: error, requestId: req.requestId }, "Unhandled server error");

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}