import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db/index.js";
import { describe, it, expect, afterAll } from "vitest";

describe("Auth API Integration Tests", () => {
  // Use a uniques email for this test run
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = "securePassword123";
  let authToken = "";

  // 1. Test Successful Signup
  it("should register a new user with status 201 and return a JWT token", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Test User",
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(typeof res.body.data.token).toBe("string");

    // save token for later tests
    authToken = res.body.data.token;
  });

  // 2. Test Dulplicate Email Prevention (409 Conflict)
  it("should reject duplicates registration with 409 Conflict", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Test User Duplicate",
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User already exists");
  });

  // 3. Test Successful Login
  it("should login successfully with status 200 and return a JWT token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
  });

  // 4. Test Invalid Password (401 Unauthorized)
  it("should reject login with wrong password with 401 Unauthorized", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: "WrongPassword999",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // 5. Test Protected Route with Valid Bearer Token (/me)
  it("should return the current user profile when valid token is provided", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.name).toBe("Test User");
  });

  // 6. Test Protected Route without Token (401 Unauthorized)
  it("should reject /me request with 401 when no token is provided", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized");
  });

  // Clean up database connection after tests finish
  afterAll(async () => {
    await pool.end();
  });
});
