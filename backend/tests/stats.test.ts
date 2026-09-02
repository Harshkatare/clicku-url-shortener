import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Public Stats API Integration Tests", () => {
  it("should return 200 and live platform metrics without authentication", async () => {
    const res = await request(app).get("/api/v1/stats/public");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalUrls");
    expect(res.body.data).toHaveProperty("totalClicks");
    expect(res.body.data).toHaveProperty("totalUsers");
    expect(typeof res.body.data.totalUrls).toBe("number");
    expect(typeof res.body.data.totalClicks).toBe("number");
    expect(typeof res.body.data.totalUsers).toBe("number");
    expect(res.body.data.totalUrls).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalClicks).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(0);
  });
});
