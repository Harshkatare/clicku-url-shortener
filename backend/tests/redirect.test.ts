import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db/index.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Redirect API Integration Tests", () => {
  let authToken = "";
  let testShortCode = "";
  let testUrlId = "";

  // Before running tests, register a user and create a short URL to redirect
  beforeAll(async () => {
    const signupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Redirect Test User",
        email: `redirect_test_${Date.now()}@example.com`,
        password: "password123",
      });

    authToken = signupRes.body.data.token;

    const createRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://example.com",
      });

    testShortCode = createRes.body.data.shortCode;
    testUrlId = createRes.body.data.id;
  });

  // 1. Test 302 Redirect
  it("should redirect to original URL with status 302 and Location header", async () => {
    const res = await request(app).get(`/${testShortCode}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com");
  });

  // 2. Test Atomic Click Counter Increment
  it("should increment click count on subsequent redirect visits", async () => {
    // Second visit
    await request(app).get(`/${testShortCode}`);

    // Verify click count via API
    const listRes = await request(app)
      .get("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`);

    const foundUrl = listRes.body.data.find(
      (u: { id: string }) => u.id === testUrlId
    );

    expect(foundUrl).toBeDefined();
    expect(foundUrl.clicks).toBe(2);
  });

  // 3. Test 404 for Non-Existent Short Code
  it("should return 404 Not Found for non-existent short code", async () => {
    const res = await request(app).get("/nonExistentShortCode999");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Short URL not found");
  });

  // Clean up database connection
  afterAll(async () => {
    await pool.end();
  });
});
