import { Request, Response, NextFunction } from "express";

import { UnauthorizedError } from "../lib/errors/index.js";

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { eq } from "drizzle-orm";

interface JwtPayload {
  userId: string;
  sid?: string;
  iat?: number;
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

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid token");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, decoded.userId),
    columns: {
      id: true,
      isActive: true,
      role: true,
      sessionsInvalidatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError("Unauthorized");
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Account is deactivated");
  }

  if (
    user.sessionsInvalidatedAt &&
    (!decoded.iat ||
      decoded.iat * 1000 <
        user.sessionsInvalidatedAt.getTime())
  ) {
    throw new UnauthorizedError(
      "Session has been revoked"
    );
  }

  req.user = {
    id: user.id,
    role: user.role,
    sid: decoded.sid,
  };

  next();
}
