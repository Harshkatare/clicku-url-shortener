import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect, beforeAll } from "vitest";

describe("Demo Link Claiming API Integration Tests", () => {
  let user1Token = "";
  let user1Id = "";
  let user2Token = "";
  let demoShortCode = "";

  beforeAll(async () => {
    const timestamp = Date.now();

    // Create User 1
    const user1Res = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Claimer One",
        email: `claim_user1_${timestamp}@example.com`,
        password: "password123",
      });

    user1Token = user1Res.body.data.token;
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${user1Token}`);
    user1Id = meRes.body.data.id;

    // Create User 2
    const user2Res = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Claimer Two",
        email: `claim_user2_${timestamp}@example.com`,
        password: "password123",
      });

    user2Token = user2Res.body.data.token;

    // Create unauthenticated demo link
    const demoRes = await request(app)
      .post("/api/v1/urls/demo")
      .send({
        originalUrl: "https://example.com/to-be-claimed",
      });

    demoShortCode = demoRes.body.data.shortCode;
  });

  it("should claim an unclaimed demo short URL with status 200 and assign user_id", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        shortCode: demoShortCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.shortCode).toBe(demoShortCode);
    expect(res.body.data.userId).toBe(user1Id);
    expect(res.body.message).toBe("URL claimed successfully");
  });

  it("should return 200 idempotently when the same user claims their already owned link again", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        shortCode: demoShortCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(user1Id);
  });

  it("should reject claim from a different user with 409 Conflict if link is already owned", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({
        shortCode: demoShortCode,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already been claimed/i);
  });

  it("should reject claim without authentication with 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .send({
        shortCode: demoShortCode,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject claim for non-existent shortCode with 404 Not Found", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        shortCode: "nonexistent999",
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should reject claim with empty or invalid shortCode with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/urls/claim")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        shortCode: "",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
