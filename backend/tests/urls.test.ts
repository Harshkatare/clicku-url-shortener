import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db/index.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("URLs API Integration Tests", () => {
  let authToken = "";
  let createdUrlId = "";
  let createdShortCode = "";

  // Before running tests, create a temporary user and get a valid JWT
  beforeAll(async () => {
    const signupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "URL Test User",
        email: `url_test_${Date.now()}@example.com`,
        password: "password123",
      });

    authToken = signupRes.body.data.token;
  });

  // 1. Test Creating a Short URL
  it("should create a shortened URL with status 201", async () => {
    const res = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://google.com",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("shortCode");
    expect(res.body.data.originalUrl).toBe("https://google.com");

    createdUrlId = res.body.data.id;
    createdShortCode = res.body.data.shortCode;
  });

  // 2. Test Listing URLs for the User
  it("should list all URLs for authenticated user with status 200", async () => {
    const res = await request(app)
      .get("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].id).toBe(createdUrlId);
  });

  // 3. Test UUID Route Param Validation (Our Audit #9 Fix!)
  it("should return 400 Bad Request when accessing with an invalid non-UUID id", async () => {
    const res = await request(app)
      .delete("/api/v1/urls/not-a-valid-uuid-123")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid URL ID format");
  });

  // 4. Test Updating the URL
  it("should update the original destination URL with status 200", async () => {
    const res = await request(app)
      .patch(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        originalUrl: "https://github.com",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.originalUrl).toBe("https://github.com");
  });

  // 5. Test Deleting the URL
  it("should delete the URL with status 200", async () => {
    const res = await request(app)
      .delete(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUrlId);
  });

  // 6. Test Deleting a Non-Existent URL (404 Not Found)
  it("should return 404 Not Found when deleting an already deleted URL", async () => {
    const res = await request(app)
      .delete(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("URL not found or unauthorized");
  });

  // Clean up database connection
  afterAll(async () => {
    await pool.end();
  });
});
