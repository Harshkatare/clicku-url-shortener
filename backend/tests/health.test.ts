import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Health Check API", () => {
  it("Should return 200 and confirm server is running", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "server is running",
    });
  });

  it("Should return 200 on /api/health route alias", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "server is running",
    });
  });
});
