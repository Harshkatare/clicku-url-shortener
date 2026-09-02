import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("Demo URL Public API Integration Tests", () => {
  let createdShortCode = "";

  it("should create a demo short URL without authorization and with null userId", async () => {
    const res = await request(app).post("/api/v1/urls/demo").send({
      originalUrl: "https://example.com/demo-test",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("shortCode");
    expect(res.body.data.shortCode).toHaveLength(6);
    expect(res.body.data.originalUrl).toBe("https://example.com/demo-test");
    expect(res.body.data.userId).toBeNull();

    createdShortCode = res.body.data.shortCode;
  });

  it("should successfully redirect to originalUrl using the created demo shortCode", async () => {
    const res = await request(app).get(`/${createdShortCode}`);

    expect(res.status).toBe(302);
    expect(res.header.location).toBe("https://example.com/demo-test");
  });

  it("should reject invalid URLs with 400 Bad Request", async () => {
    const res = await request(app).post("/api/v1/urls/demo").send({
      originalUrl: "not-a-valid-url",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
