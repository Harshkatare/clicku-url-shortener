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

  // 4. Test Custom Alias Creation and 302 Redirect
  it("should create URL with custom alias and redirect to original URL with status 302", async () => {
    const customAlias = `promo-${Date.now()}`;
    const createRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://example.com/promo-target",
        customAlias,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.customAlias).toBe(customAlias);

    // Visit via custom alias
    const redirectRes = await request(app).get(`/${customAlias}`);
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe("https://example.com/promo-target");
  });

  // 5. Test 409 Conflict for Duplicate Custom Alias
  it("should return 409 Conflict when attempting to register an already taken custom alias", async () => {
    const duplicateAlias = `duplicate-${Date.now()}`;

    // First registration
    const firstRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://example.com/first",
        customAlias: duplicateAlias,
      });
    expect(firstRes.status).toBe(201);

    // Duplicate attempt
    const secondRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://example.com/second",
        customAlias: duplicateAlias,
      });
    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.message).toBe("Custom alias already in use");
  });

  // Test 6: Test that incoming UTM tracking tags are preserved across the 302 redirect
  it("should preserve and forward incoming UTM query parameters across 302 redirect", async () => {
    const res = await request(app).get(
      `/${testShortCode}?utm_source=twitter&utm_medium=social`
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      "https://example.com/?utm_source=twitter&utm_medium=social"
    );
  });

  // Test 7: Test that incoming query parameters merge cleanly when the destination URL ALREADY has query parameters
  it("should merge incoming query parameters with existing query parameters on originalUrl", async () => {
    const customAlias = `merge-${Date.now()}`;

    await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://example.com/item?id=42",
        customAlias,
      });

    const res = await request(app).get(
      `/${customAlias}?utm_campaign=summer&ref=affiliate`
    );

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      "https://example.com/item?id=42&utm_campaign=summer&ref=affiliate"
    );
  });

  // Clean up database connection
  afterAll(async () => {
    await pool.end();
  });
});
