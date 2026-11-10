import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Express } from "express";

describe("Cookie Transport Diagnostic API (GET /api/v1/auth/test-cookie)", () => {
  let app: Express;
  const originalDiagToken = process.env.DIAG_TOKEN;
  const validToken = "test-token-at-least-16-chars";

  beforeAll(async () => {
    process.env.DIAG_TOKEN = validToken;
    const mod = await import("../src/app.js");
    app = mod.default;
  });

  afterAll(() => {
    if (originalDiagToken === undefined) {
      delete process.env.DIAG_TOKEN;
    } else {
      process.env.DIAG_TOKEN = originalDiagToken;
    }
  });

  it("returns 404 and generic body when X-Diag-Token is missing", async () => {
    const response = await request(app).get("/api/v1/auth/test-cookie");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("returns 404 and generic body when X-Diag-Token is wrong but same length", async () => {
    const wrongSameLength = "test-token-at-least-16-charz";
    expect(wrongSameLength.length).toBe(validToken.length);

    const response = await request(app)
      .get("/api/v1/auth/test-cookie")
      .set("X-Diag-Token", wrongSameLength);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("returns 404 and generic body when X-Diag-Token has mismatched length without 500 RangeError", async () => {
    const wrongLength = "short-token";
    const response = await request(app)
      .get("/api/v1/auth/test-cookie")
      .set("X-Diag-Token", wrongLength);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("returns 204, no-store, and Set-Cookie with correct flags when valid X-Diag-Token is supplied", async () => {
    const response = await request(app)
      .get("/api/v1/auth/test-cookie")
      .set("X-Diag-Token", validToken);

    expect(response.status).toBe(204);
    expect(response.headers["cache-control"]).toBe("no-store");

    const setCookie = response.headers["set-cookie"];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie.length).toBeGreaterThan(0);
    const cookieHeader = setCookie[0];

    expect(cookieHeader).toContain("sl_diag_test=1");
    expect(cookieHeader).toContain("HttpOnly");
    expect(cookieHeader).toContain("Secure");
    expect(cookieHeader).toContain("SameSite=Lax");
    expect(cookieHeader).toContain("Path=/api/v1/auth");
    expect(cookieHeader).toContain("Max-Age=60");

    expect(response.body).toEqual({});
    expect(response.text).toBe("");
    expect(JSON.stringify(response.headers)).not.toContain(validToken);
  });
});
