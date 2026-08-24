import { Request, Response, NextFunction } from "express";

import crypto from "crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.requestId =
    crypto.randomUUID();

  res.setHeader("X-Request-ID", req.requestId);

  next();
}