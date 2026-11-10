import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Express } from "express";

describe("Proxy Hop Diagnostic API (GET /api/v1/health/ip)", () => {
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
    const response = await request(app).get("/api/v1/health/ip");

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
      .get("/api/v1/health/ip")
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
      .get("/api/v1/health/ip")
      .set("X-Diag-Token", wrongLength);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
    });
  });

  it("returns 200, no-store, and diagnostic payload when valid X-Diag-Token is supplied", async () => {
    const response = await request(app)
      .get("/api/v1/health/ip")
      .set("X-Diag-Token", validToken);

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");

    expect(typeof response.body.ip === "string" || response.body.ip === null).toBe(true);
    expect(Array.isArray(response.body.ips)).toBe(true);
    expect(
      typeof response.body.forwardedFor === "string" || response.body.forwardedFor === null
    ).toBe(true);

    expect(JSON.stringify(response.body)).not.toContain(validToken);
  });
});
