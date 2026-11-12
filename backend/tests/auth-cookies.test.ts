import { Response } from "express";
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { env } from "../src/config/env.js";

import {
  clearRefreshCookie,
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  setRefreshCookie,
} from "../src/modules/auth/auth.cookies.js";

const originalNodeEnv = env.NODE_ENV;

function createResponse() {
  const cookie = vi.fn();

  return {
    response: { cookie } as unknown as Response,

    cookie,
  };
}

afterEach(() => {
  env.NODE_ENV = originalNodeEnv;
});

describe("refresh cookie helpers", () => {
  it("defines the v0.9.0 refresh cookie contract", () => {
    expect(REFRESH_COOKIE_NAME).toBe(
      "refreshToken"
    );

    expect(REFRESH_COOKIE_PATH).toBe(
      "/api/v1/auth"
    );

    expect(REFRESH_COOKIE_MAX_AGE_MS).toBe(
      604_800_000
    );
  });

  it("sets the raw refresh token with host-only HttpOnly Lax options", () => {
    const { response, cookie } =
      createResponse();

    setRefreshCookie(
      response,
      "raw-refresh-token"
    );

    expect(cookie).toHaveBeenCalledTimes(1);

    const [
      name,
      value,
      options,
    ] = cookie.mock.calls[0];

    expect(name).toBe(
      REFRESH_COOKIE_NAME
    );

    expect(value).toBe(
      "raw-refresh-token"
    );

    expect(options).toMatchObject({
      httpOnly: true,

      secure: false,

      sameSite: "lax",

      path: REFRESH_COOKIE_PATH,

      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });

    expect(options).not.toHaveProperty(
      "domain"
    );
  });

  it("sets Secure when NODE_ENV is production", () => {
    env.NODE_ENV = "production";

    const { response, cookie } =
      createResponse();

    setRefreshCookie(response, "token");

    const [, , options] =
      cookie.mock.calls[0];

    expect(options).toMatchObject({
      secure: true,
    });
  });

  it("clears the refresh cookie with Max-Age=0 and identical flags", () => {
    const { response, cookie } =
      createResponse();

    clearRefreshCookie(response);

    expect(cookie).toHaveBeenCalledTimes(1);

    const [
      name,
      value,
      options,
    ] = cookie.mock.calls[0];

    expect(name).toBe(
      REFRESH_COOKIE_NAME
    );

    expect(value).toBe("");

    expect(options).toMatchObject({
      httpOnly: true,

      secure: false,

      sameSite: "lax",

      path: REFRESH_COOKIE_PATH,

      maxAge: 0,
    });

    expect(options).not.toHaveProperty(
      "domain"
    );
  });
});
