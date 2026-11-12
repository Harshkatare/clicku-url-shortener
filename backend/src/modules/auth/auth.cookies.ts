import { CookieOptions, Response } from "express";

import { env } from "../../config/env.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

export const REFRESH_COOKIE_PATH = "/api/v1/auth";

export const REFRESH_COOKIE_MAX_AGE_MS =
  7 * 24 * 60 * 60 * 1000;

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,

    secure: env.NODE_ENV === "production",

    sameSite: "lax",

    path: REFRESH_COOKIE_PATH,
  };
}

export function setRefreshCookie(
  res: Response,
  token: string
): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...refreshCookieOptions(),

    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(
  res: Response
): void {
  res.cookie(REFRESH_COOKIE_NAME, "", {
    ...refreshCookieOptions(),

    maxAge: 0,
  });
}
