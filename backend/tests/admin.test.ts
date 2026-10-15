import request from "supertest";
import app from "../src/app.js";
import { db, pool } from "../src/db/index.js";
import { users } from "../src/db/schema/users.js";
import { urls } from "../src/db/schema/urls.js";
import { eq, sql } from "drizzle-orm";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Admin API Integration Tests", () => {
  let adminToken = "";
  let adminUserId = "";
  const adminEmail = `admin_test_${Date.now()}@example.com`;
  const adminName = "Admin Test User";

  let nonAdminToken = "";
  let nonAdminUserId = "";
  const nonAdminEmail = `non_admin_test_${Date.now()}@example.com`;
  const nonAdminName = "Non-Admin Test User";

  beforeAll(async () => {
    // 1. Create admin user and promote via direct DB update
    const adminSignupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: adminName,
        email: adminEmail,
        password: "adminpassword123",
      });

    adminToken = adminSignupRes.body.data.token;

    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    });
    adminUserId = adminUser!.id;

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, adminUserId));

    // 2. Create standard non-admin user
    const nonAdminSignupRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: nonAdminName,
        email: nonAdminEmail,
        password: "userpassword123",
      });

    nonAdminToken = nonAdminSignupRes.body.data.token;

    const nonAdminUser = await db.query.users.findFirst({
      where: eq(users.email, nonAdminEmail),
    });
    nonAdminUserId = nonAdminUser!.id;

    // 3. Create a URL under admin to guarantee non-zero state
    await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        originalUrl: "https://example.com/admin-test-link",
      });
  });

  afterAll(async () => {
    await pool.end();
  });

  // 1. Admin calls GET /api/v1/admin/stats -> 200 OK with platform and health
  it("should allow admin user to retrieve platform statistics with status 200", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("platform");
    expect(res.body.data).toHaveProperty("health");

    const { platform, health } = res.body.data;
    expect(typeof platform.totalUsers).toBe("number");
    expect(typeof platform.totalUrls).toBe("number");
    expect(typeof platform.totalClicks).toBe("number");
    expect(typeof platform.activeUsers30d).toBe("number");

    expect(typeof health.dbPoolTotal).toBe("number");
    expect(typeof health.dbPoolIdle).toBe("number");
    expect(typeof health.dbPoolWaiting).toBe("number");
    expect(typeof health.uptimeSeconds).toBe("number");
  });

  // 2. Non-admin calls GET /api/v1/admin/stats -> 403 Forbidden
  it("should return 403 Forbidden when non-admin user attempts to access stats", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${nonAdminToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Forbidden");
  });

  // 3. Unauthenticated call to GET /api/v1/admin/stats -> 401 Unauthorized
  it("should return 401 Unauthorized when unauthenticated request attempts to access stats", async () => {
    const res = await request(app).get("/api/v1/admin/stats");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Unauthorized");
  });

  // 4. Admin stats response contains zero PII
  it("should contain zero PII in admin stats response body", async () => {
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const bodyString = JSON.stringify(res.body);

    // Reject user emails
    expect(bodyString).not.toContain(adminEmail);
    expect(bodyString).not.toContain(nonAdminEmail);

    // Reject user names
    expect(bodyString).not.toContain(adminName);
    expect(bodyString).not.toContain(nonAdminName);

    // Reject user UUID identifiers
    expect(bodyString).not.toContain(adminUserId);
    expect(bodyString).not.toContain(nonAdminUserId);

    // Reject credentials and sensitive keywords
    expect(bodyString).not.toContain("adminpassword123");
    expect(bodyString).not.toContain("userpassword123");
    expect(bodyString.toLowerCase()).not.toContain("password");
    expect(bodyString.toLowerCase()).not.toContain("hash");
    expect(bodyString.toLowerCase()).not.toContain("email");
  });

  // 5. Admin stats platform counts are accurate
  it("should accurately reflect database counts for users, urls, and clicks", async () => {
    const [userCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [urlCountRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(urls);

    const [clicksSumRes] = await db
      .select({ sum: sql<number>`coalesce(sum(${urls.clicks}), 0)::int` })
      .from(urls);

    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const { platform, health } = res.body.data;

    expect(platform.totalUsers).toBe(userCountRes.count);
    expect(platform.totalUrls).toBe(urlCountRes.count);
    expect(platform.totalClicks).toBe(clicksSumRes.sum);
    expect(platform.activeUsers30d).toBeGreaterThanOrEqual(2);

    expect(health.dbPoolTotal).toBeGreaterThanOrEqual(0);
    expect(health.dbPoolIdle).toBeGreaterThanOrEqual(0);
    expect(health.dbPoolWaiting).toBeGreaterThanOrEqual(0);
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });
});
