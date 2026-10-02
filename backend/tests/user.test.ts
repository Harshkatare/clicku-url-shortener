import request from "supertest";
import { describe, it, expect, afterAll } from "vitest";
import { eq } from "drizzle-orm";

import app from "../src/app.js";
import { db, pool } from "../src/db/index.js";
import { users } from "../src/db/schema/users.js";
import { urls } from "../src/db/schema/urls.js";

describe("User Settings & Lifecycle Integration Tests (11 Scenarios)", () => {
  const initialPassword = "InitialPassword123!";
  const newPassword = "NewSecurePassword123!";
  let primaryToken = "";
  let primaryUserId = "";
  let primaryEmail = "";

  const secondaryPassword = "SecondaryPassword123!";
  let secondaryEmail = "";

  // 1. Setup primary and secondary users
  it("should setup test users for settings scenarios", async () => {
    primaryEmail = `settings_user_${Date.now()}@example.com`;
    const resPrimary = await request(app).post("/api/v1/auth/signup").send({
      name: "Primary User",
      email: primaryEmail,
      password: initialPassword,
    });
    expect(resPrimary.status).toBe(201);
    primaryToken = resPrimary.body.data.token;

    // Retrieve userId
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${primaryToken}`);
    expect(meRes.status).toBe(200);
    primaryUserId = meRes.body.data.id;

    secondaryEmail = `secondary_user_${Date.now()}@example.com`;
    const resSecondary = await request(app).post("/api/v1/auth/signup").send({
      name: "Secondary User",
      email: secondaryEmail,
      password: secondaryPassword,
    });
    expect(resSecondary.status).toBe(201);
  });

  // 2. Profile update success
  it("should update user profile name and email with 200 OK", async () => {
    const updatedEmail = `updated_${Date.now()}@example.com`;
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        name: "Primary User Updated",
        email: updatedEmail,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Primary User Updated");
    expect(res.body.data.email).toBe(updatedEmail.toLowerCase());
    primaryEmail = updatedEmail.toLowerCase();
  });

  // 3. Duplicate email conflict (409)
  it("should reject profile update with 409 Conflict when email belongs to another user", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        name: "Attempted Conflict",
        email: secondaryEmail,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email already in use");
  });

  // 4. Updating name with existing own email
  it("should allow updating name with existing own email without 409 conflict", async () => {
    const res = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        name: "Primary Renamed",
        email: primaryEmail,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Primary Renamed");
  });

  // 5. Password change rejection with weak password (missing entropy)
  it("should reject password change with 400 Bad Request when new password lacks entropy", async () => {
    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        currentPassword: initialPassword,
        newPassword: "lowercaseandnumbers123",
        confirmPassword: "lowercaseandnumbers123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 6. Password change rejection with mismatched confirmation
  it("should reject password change with 400 Bad Request when confirmation does not match", async () => {
    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        currentPassword: initialPassword,
        newPassword: newPassword,
        confirmPassword: "DifferentPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 7. Password change rejection with incorrect current password
  it("should reject password change with 401 Unauthorized when current password is wrong", async () => {
    const res = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        currentPassword: "IncorrectCurrentPassword123!",
        newPassword: newPassword,
        confirmPassword: newPassword,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Incorrect current password");
  });

  // 8. Password change success and login verification
  it("should successfully change password with 200 OK and allow login with new password", async () => {
    const changeRes = await request(app)
      .post("/api/v1/users/me/change-password")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        currentPassword: initialPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    // Verify login with new password
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: primaryEmail,
      password: newPassword,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data).toHaveProperty("token");
    primaryToken = loginRes.body.data.token;
  });

  // 9. Data export structure and URL inclusion
  it("should export user data with 200 OK, attachment header, and URLs", async () => {
    // Create a link first
    const createUrlRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        originalUrl: "https://example.com/export-test-destination",
      });
    expect(createUrlRes.status).toBe(201);

    const exportRes = await request(app)
      .get("/api/v1/users/me/export")
      .set("Authorization", `Bearer ${primaryToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers["content-disposition"]).toContain(
      'attachment; filename="shortlynk-data-export.json"'
    );
    expect(exportRes.headers["content-type"]).toContain("application/json");

    expect(exportRes.body).toHaveProperty("user");
    expect(exportRes.body.user.email).toBe(primaryEmail);
    expect(exportRes.body.user).not.toHaveProperty("passwordHash");

    expect(exportRes.body).toHaveProperty("urls");
    expect(Array.isArray(exportRes.body.urls)).toBe(true);
    expect(exportRes.body.urls.length).toBeGreaterThanOrEqual(1);

    const exportedUrl = exportRes.body.urls.find(
      (u: { originalUrl: string }) => u.originalUrl === "https://example.com/export-test-destination"
    );
    expect(exportedUrl).toBeDefined();
    expect(exportedUrl).toHaveProperty("shortCode");
    expect(exportedUrl).toHaveProperty("isPinned");
    expect(exportedUrl).toHaveProperty("sortOrder");
    expect(exportRes.body).toHaveProperty("exportedAt");
  });

  // 10. Account deletion rejection with wrong password
  it("should reject account deletion with 401 Unauthorized when password is wrong", async () => {
    const res = await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        password: "WrongPassword123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Incorrect password");
  });

  // 11. Account deletion success and cascade verification
  it("should delete account with 200 OK and cascade delete user URLs in database", async () => {
    const deleteRes = await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", `Bearer ${primaryToken}`)
      .send({
        password: newPassword,
      });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify user record is gone in database
    const userInDb = await db.query.users.findFirst({
      where: eq(users.id, primaryUserId),
    });
    expect(userInDb).toBeUndefined();

    // Verify URLs created by user are deleted by cascade in database
    const urlsInDb = await db.query.urls.findMany({
      where: eq(urls.userId, primaryUserId),
    });
    expect(urlsInDb.length).toBe(0);

    // Verify subsequent requests with old token return 401
    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${primaryToken}`);
    expect(meRes.status).toBe(401);
  });

  afterAll(async () => {
    await pool.end();
  });
});
