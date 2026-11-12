import crypto from "crypto";

import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

export const ACCESS_TOKEN_TTL = "15m";

export const REFRESH_TOKEN_BYTES = 64;

export interface RefreshTokenPair {
  token: string;
  tokenHash: string;
}

export function generateAccessToken(
  userId: string,
  sid?: string
): string {
  return jwt.sign(
    sid ? { userId, sid } : { userId },
    env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
    }
  );
}

export function hashRefreshToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function generateRefreshToken(): RefreshTokenPair {
  const token = crypto
    .randomBytes(REFRESH_TOKEN_BYTES)
    .toString("base64url");

  return {
    token,
    tokenHash: hashRefreshToken(token),
  };
}
