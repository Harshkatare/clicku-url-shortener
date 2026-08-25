import { Request, Response, NextFunction } from "express";

import { UnauthorizedError } from "../lib/errors/index.js";

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface JwtPayload {
  userId: string;
}

export async function protect(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    throw new UnauthorizedError("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as JwtPayload;

    req.user = {
      id: decoded.userId,
    };

    next();
  } catch {
    throw new UnauthorizedError("Invalid token");
  }
}