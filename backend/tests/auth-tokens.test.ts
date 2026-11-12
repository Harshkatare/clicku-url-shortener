import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import { describe, expect, it } from "vitest";

import { env } from "../src/config/env.js";

import { generateToken } from "../src/lib/generate-token.js";

import {
  ACCESS_TOKEN_TTL,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_BYTES,
} from "../src/modules/auth/auth.tokens.js";

type TokenPayload = JwtPayload & {
  userId: string;
  sid?: string;
};

function decode(token: string): TokenPayload {
  return jwt.verify(
    token,
    env.JWT_SECRET
  ) as TokenPayload;
}

describe("auth token helpers", () => {
  it("creates a 15-minute access token with userId and sid", () => {
    const token = generateAccessToken(
      "user-1",
      "session-1"
    );

    const payload = decode(token);

    expect(ACCESS_TOKEN_TTL).toBe("15m");

    expect(payload.userId).toBe("user-1");

    expect(payload.sid).toBe("session-1");

    expect(payload.iat).toBeTypeOf("number");

    expect(payload.exp).toBeTypeOf("number");

    expect(
      (payload.exp as number) -
        (payload.iat as number)
    ).toBe(900);
  });

  it("omits sid when no session id is provided", () => {
    const payload = decode(
      generateAccessToken("user-1")
    );

    expect(payload.userId).toBe("user-1");

    expect(payload.sid).toBeUndefined();
  });

  it("keeps the legacy 7-day token unchanged", () => {
    const payload = decode(
      generateToken("user-1")
    );

    expect(payload.userId).toBe("user-1");

    expect(payload.sid).toBeUndefined();

    expect(
      (payload.exp as number) -
        (payload.iat as number)
    ).toBe(604_800);
  });

  it("generates a 64-byte base64url refresh token and SHA-256 hash", () => {
    const { token, tokenHash } =
      generateRefreshToken();

    expect(token).toMatch(
      /^[A-Za-z0-9_-]+$/
    );

    expect(
      Buffer.from(token, "base64url")
    ).toHaveLength(REFRESH_TOKEN_BYTES);

    expect(tokenHash).toMatch(
      /^[a-f0-9]{64}$/
    );

    expect(tokenHash).toBe(
      hashRefreshToken(token)
    );
  });

  it("generates unique refresh tokens", () => {
    const first = generateRefreshToken();

    const second = generateRefreshToken();

    expect(first.token).not.toBe(
      second.token
    );

    expect(first.tokenHash).not.toBe(
      second.tokenHash
    );
  });

  it("hashes deterministically without exposing the raw token", () => {
    const raw = "raw-refresh-token";

    const hash = hashRefreshToken(raw);

    expect(hash).toBe(
      hashRefreshToken(raw)
    );

    expect(hash).not.toContain(raw);
  });
});
