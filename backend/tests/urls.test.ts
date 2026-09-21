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
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  // 3. Test Query Engine: Search, Filter, Pagination, and Sorting
  describe("Query Engine & Pagination Tests", () => {
    let secondAuthToken = "";

    beforeAll(async () => {
      // Create additional URLs for the primary test user
      await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          originalUrl: "https://docs.shortlynk.in/guide",
          customAlias: `docs-alias-${Date.now()}`,
          status: "active",
        });

      await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          originalUrl: "https://archive.example.org/old-post",
          customAlias: `archived-link-${Date.now()}`,
          status: "archived",
        });

      await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          originalUrl: "https://pricing.example.com/plans",
          status: "active",
        });

      await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          originalUrl: "https://shop.example.com/50%_discount_deal",
          status: "active",
        });

      // Create a second isolated user to verify tenant isolation
      const secondUserRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Second User Tenant",
          email: `tenant_${Date.now()}@example.com`,
          password: "password123",
        });

      secondAuthToken = secondUserRes.body.data.token;
    });

    it("should search URLs by destination URL and custom alias", async () => {
      const res = await request(app)
        .get("/api/v1/urls?search=docs.shortlynk.in")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].originalUrl).toContain("docs.shortlynk.in");
      expect(res.body.pagination.total).toBe(1);
    });

    it("should escape SQL LIKE wildcards (% and _) and search for literal characters", async () => {
      const res = await request(app)
        .get("/api/v1/urls?search=50%_discount")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].originalUrl).toContain("50%_discount_deal");
      expect(res.body.pagination.total).toBe(1);
    });

    it("should return empty array for non-matching search", async () => {
      const res = await request(app)
        .get("/api/v1/urls?search=nonexistent-string-999xyz")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
      expect(res.body.pagination.totalPages).toBe(0);
    });

    it("should filter URLs by status (active)", async () => {
      const res = await request(app)
        .get("/api/v1/urls?status=active")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      for (const item of res.body.data) {
        expect(item.status).toBe("active");
      }
    });

    it("should filter URLs by status (archived)", async () => {
      const res = await request(app)
        .get("/api/v1/urls?status=archived")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      for (const item of res.body.data) {
        expect(item.status).toBe("archived");
      }
    });

    it("should filter by combined search and status parameters", async () => {
      // 1. Matches docs and is active -> 1 result
      const activeRes = await request(app)
        .get("/api/v1/urls?search=docs.shortlynk.in&status=active")
        .set("Authorization", `Bearer ${authToken}`);

      expect(activeRes.status).toBe(200);
      expect(activeRes.body.success).toBe(true);
      expect(activeRes.body.data.length).toBe(1);
      expect(activeRes.body.data[0].originalUrl).toContain("docs.shortlynk.in");
      expect(activeRes.body.data[0].status).toBe("active");
      expect(activeRes.body.pagination.total).toBe(1);

      // 2. Matches docs but is archived -> 0 results
      const archivedRes = await request(app)
        .get("/api/v1/urls?search=docs.shortlynk.in&status=archived")
        .set("Authorization", `Bearer ${authToken}`);

      expect(archivedRes.status).toBe(200);
      expect(archivedRes.body.success).toBe(true);
      expect(archivedRes.body.data.length).toBe(0);
      expect(archivedRes.body.pagination.total).toBe(0);
    });

    it("should paginate results correctly with limit and page", async () => {
      const page1Res = await request(app)
        .get("/api/v1/urls?page=1&limit=2")
        .set("Authorization", `Bearer ${authToken}`);

      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.length).toBe(2);
      expect(page1Res.body.pagination.page).toBe(1);
      expect(page1Res.body.pagination.limit).toBe(2);
      expect(page1Res.body.pagination.total).toBeGreaterThanOrEqual(4);
      expect(page1Res.body.pagination.totalPages).toBeGreaterThanOrEqual(2);

      const page2Res = await request(app)
        .get("/api/v1/urls?page=2&limit=2")
        .set("Authorization", `Bearer ${authToken}`);

      expect(page2Res.status).toBe(200);
      expect(page2Res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(page2Res.body.pagination.page).toBe(2);

      // Verify page 1 and page 2 items are disjoint
      const page1Ids = page1Res.body.data.map((u: any) => u.id);
      const page2Ids = page2Res.body.data.map((u: any) => u.id);
      expect(page1Ids.some((id: string) => page2Ids.includes(id))).toBe(false);
    });

    it("should sort URLs by creation date ascending and descending", async () => {
      const descRes = await request(app)
        .get("/api/v1/urls?sortBy=createdAt&sortDir=desc")
        .set("Authorization", `Bearer ${authToken}`);

      const ascRes = await request(app)
        .get("/api/v1/urls?sortBy=createdAt&sortDir=asc")
        .set("Authorization", `Bearer ${authToken}`);

      expect(descRes.status).toBe(200);
      expect(ascRes.status).toBe(200);

      const descFirst = new Date(descRes.body.data[0].createdAt).getTime();
      const ascFirst = new Date(ascRes.body.data[0].createdAt).getTime();
      expect(descFirst).toBeGreaterThanOrEqual(ascFirst);
    });

    it("should reject invalid limit > 50 with 400 Bad Request (DoS Guard)", async () => {
      const res = await request(app)
        .get("/api/v1/urls?limit=100")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid page < 1 with 400 Bad Request", async () => {
      const res = await request(app)
        .get("/api/v1/urls?page=0")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should enforce strict tenant isolation (User B cannot see User A links)", async () => {
      const res = await request(app)
        .get("/api/v1/urls?search=docs.shortlynk.in")
        .set("Authorization", `Bearer ${secondAuthToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
      expect(res.body.pagination.total).toBe(0);
    });
  });

  // 4. Test UUID Route Param Validation (Our Audit #9 Fix!)
  it("should return 400 Bad Request when accessing with an invalid non-UUID id", async () => {
    const res = await request(app)
      .delete("/api/v1/urls/not-a-valid-uuid-123")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid URL ID format");
  });

  // 5. Test Updating the URL (PATCH /api/v1/urls/:id)
  describe("PATCH /api/v1/urls/:id Comprehensive Tests", () => {
    let secondUrlId = "";
    let secondShortCode = "";
    const testAlias = `custom-patch-${Date.now()}`;

    beforeAll(async () => {
      // Create a second URL to test collision scenarios against
      const secondRes = await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          originalUrl: "https://second-target.example.com",
          customAlias: `existing-alias-${Date.now()}`,
          status: "active",
        });

      secondUrlId = secondRes.body.data.id;
      secondShortCode = secondRes.body.data.shortCode;
    });

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

    it("should update the custom vanity alias with status 200", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: testAlias,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customAlias).toBe(testAlias);
    });

    it("should allow resubmitting the same custom alias on the same URL idempotently", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: testAlias,
          originalUrl: "https://github.com/updated",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customAlias).toBe(testAlias);
      expect(res.body.data.originalUrl).toBe("https://github.com/updated");
    });

    it("should update the lifecycle status to archived with status 200", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "archived",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("archived");
    });

    it("should update the lifecycle status back to active with status 200", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "active",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("active");
    });

    it("should clear custom alias when sending null", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: null,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customAlias).toBeNull();
    });

    it("should reject same-column duplicate custom alias with 409 Conflict", async () => {
      // Try to set createdUrlId's alias to secondUrl's existing alias
      const secondUrlRes = await request(app)
        .get("/api/v1/urls")
        .set("Authorization", `Bearer ${authToken}`);
      
      const targetAlias = secondUrlRes.body.data.find(
        (u: any) => u.id === secondUrlId
      )?.customAlias;

      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: targetAlias,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Custom alias already in use");
    });

    it("should reject cross-column collision when customAlias matches another URL's shortCode with 409 Conflict", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: secondShortCode,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Custom alias already in use");
    });

    it("should reject reserved slug as custom alias with 400 Bad Request", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          customAlias: "dashboard",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid status with 400 Bad Request", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "non_existent_status",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 Bad Request when updating with an empty body", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject unauthorized update of another user's URL with 404 Not Found", async () => {
      const otherUserRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Other User For Patch",
          email: `other_patch_${Date.now()}@example.com`,
          password: "password123",
        });
      
      const otherToken = otherUserRes.body.data.token;

      const res = await request(app)
        .patch(`/api/v1/urls/${createdUrlId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({
          originalUrl: "https://malicious-hijack.com",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("URL not found or unauthorized");
    });
  });

  // 7. Test Card Reordering (PATCH /api/v1/urls/:id/reorder)
  describe("Card Reordering Tests (PATCH /api/v1/urls/:id/reorder)", () => {
    let reorderUserToken = "";
    let reorderUrlIds: string[] = [];

    beforeAll(async () => {
      // Create dedicated user for reorder tests
      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Reorder Test User",
          email: `reorder_test_${Date.now()}@example.com`,
          password: "password123",
        });

      reorderUserToken = signupRes.body.data.token;

      // Create 4 URLs for this user
      for (let i = 0; i < 4; i++) {
        const createRes = await request(app)
          .post("/api/v1/urls")
          .set("Authorization", `Bearer ${reorderUserToken}`)
          .send({
            originalUrl: `https://reorder-item-${i}.example.com`,
          });
        reorderUrlIds.push(createRes.body.data.id);
      }

      // Explicitly initialize their sortOrders to 0, 1, 2, 3 in the database
      for (let i = 0; i < 4; i++) {
        await pool.query("UPDATE urls SET sort_order = $1 WHERE id = $2", [i, reorderUrlIds[i]]);
      }
    });

    it("should successfully reorder a card by moving down (0 -> 2) and shift intervening items", async () => {
      // Move Item 0 to index 2
      const targetId = reorderUrlIds[0];
      const res = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Card reordered successfully");
      expect(res.body.data.id).toBe(targetId);
      expect(res.body.data.sortOrder).toBe(2);

      // Verify list order via GET /api/v1/urls?sortBy=sortOrder&sortDir=asc
      const listRes = await request(app)
        .get("/api/v1/urls?sortBy=sortOrder&sortDir=asc")
        .set("Authorization", `Bearer ${reorderUserToken}`);

      expect(listRes.status).toBe(200);
      const items = listRes.body.data;
      // Original: [0, 1, 2, 3] -> Move 0 to 2 -> Expected: [1(now 0), 2(now 1), 0(now 2), 3(stay 3)]
      expect(items.find((u: any) => u.id === reorderUrlIds[1]).sortOrder).toBe(0);
      expect(items.find((u: any) => u.id === reorderUrlIds[2]).sortOrder).toBe(1);
      expect(items.find((u: any) => u.id === reorderUrlIds[0]).sortOrder).toBe(2);
      expect(items.find((u: any) => u.id === reorderUrlIds[3]).sortOrder).toBe(3);
    });

    it("should successfully reorder a card by moving up (2 -> 0) and shift intervening items", async () => {
      // Move Item 0 (currently at 2) back to 0
      const targetId = reorderUrlIds[0];
      const res = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 0 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sortOrder).toBe(0);

      const listRes = await request(app)
        .get("/api/v1/urls?sortBy=sortOrder&sortDir=asc")
        .set("Authorization", `Bearer ${reorderUserToken}`);

      const items = listRes.body.data;
      // Expected: [0(now 0), 1(now 1), 2(now 2), 3(stay 3)]
      expect(items.find((u: any) => u.id === reorderUrlIds[0]).sortOrder).toBe(0);
      expect(items.find((u: any) => u.id === reorderUrlIds[1]).sortOrder).toBe(1);
      expect(items.find((u: any) => u.id === reorderUrlIds[2]).sortOrder).toBe(2);
      expect(items.find((u: any) => u.id === reorderUrlIds[3]).sortOrder).toBe(3);
    });

    it("should handle idempotent reorder when newSortOrder equals current sortOrder", async () => {
      const targetId = reorderUrlIds[0];
      const res = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 0 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sortOrder).toBe(0);
    });

    it("should enforce tenant isolation and reject reordering another user's URL with 404", async () => {
      const otherUserRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Other Reorder User",
          email: `other_reorder_${Date.now()}@example.com`,
          password: "password123",
        });
      const otherToken = otherUserRes.body.data.token;

      const res = await request(app)
        .patch(`/api/v1/urls/${reorderUrlIds[0]}/reorder`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ newSortOrder: 5 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("URL not found or unauthorized");
    });

    it("should return 404 when reordering non-existent URL UUID", async () => {
      const nonExistentId = "00000000-0000-4000-8000-000000000000";
      const res = await request(app)
        .patch(`/api/v1/urls/${nonExistentId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 1 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("URL not found or unauthorized");
    });

    it("should return 400 Bad Request when URL ID is not a valid UUID", async () => {
      const res = await request(app)
        .patch("/api/v1/urls/invalid-uuid-format/reorder")
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 1 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 Bad Request when newSortOrder is negative or non-integer", async () => {
      const targetId = reorderUrlIds[0];

      // Negative
      const negRes = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: -5 });

      expect(negRes.status).toBe(400);
      expect(negRes.body.success).toBe(false);

      // Float / non-integer
      const floatRes = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({ newSortOrder: 2.7 });

      expect(floatRes.status).toBe(400);
      expect(floatRes.body.success).toBe(false);

      // Empty object
      const emptyRes = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .set("Authorization", `Bearer ${reorderUserToken}`)
        .send({});

      expect(emptyRes.status).toBe(400);
      expect(emptyRes.body.success).toBe(false);
    });

    it("should return 401 Unauthorized when no auth token is provided", async () => {
      const targetId = reorderUrlIds[0];
      const res = await request(app)
        .patch(`/api/v1/urls/${targetId}/reorder`)
        .send({ newSortOrder: 1 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // 7. Test Deleting the URL
  it("should delete the URL with status 200", async () => {
    const res = await request(app)
      .delete(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdUrlId);
  });

  // 8. Test Deleting a Non-Existent URL (404 Not Found)
  it("should return 404 Not Found when deleting an already deleted URL", async () => {
    const res = await request(app)
      .delete(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("URL not found or unauthorized");
  });

  // 9. Test User URL Aggregate Stats (GET /api/v1/urls/stats)
  describe("User URL Aggregate Stats Tests", () => {
    it("should return 200 and accurate user url stats for authenticated user", async () => {
      const res = await request(app)
        .get("/api/v1/urls/stats")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.totalUrls).toBe("number");
      expect(typeof res.body.data.totalClicks).toBe("number");
      expect(typeof res.body.data.activeLinks).toBe("number");
      expect(typeof res.body.data.expiringLinks).toBe("number");
      expect(typeof res.body.data.archivedLinks).toBe("number");
      expect(typeof res.body.data.avgClicksPerLink).toBe("number");
      expect(res.body.data.totalUrls).toBeGreaterThanOrEqual(1);
    });

    it("should return 401 Unauthorized when no token is provided", async () => {
      const res = await request(app).get("/api/v1/urls/stats");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return zeroes for a fresh user with no URLs", async () => {
      const freshSignup = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Zero URLs User",
          email: `zero_urls_${Date.now()}@example.com`,
          password: "password123",
        });

      const freshToken = freshSignup.body.data.token;

      const res = await request(app)
        .get("/api/v1/urls/stats")
        .set("Authorization", `Bearer ${freshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        totalUrls: 0,
        totalClicks: 0,
        activeLinks: 0,
        expiringLinks: 0,
        archivedLinks: 0,
        avgClicksPerLink: 0,
      });
    });
  });

  describe("PATCH /api/v1/urls/:id (Pinned URLs) & Sticky Hoisting", () => {
    let pinUserToken: string;
    let urlAId: string;
    let urlBId: string;

    beforeAll(async () => {
      const signupRes = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Pin Test User",
          email: `pin_user_${Date.now()}@example.com`,
          password: "password123",
        });
      pinUserToken = signupRes.body.data.token;

      // Create URL A (older)
      const resA = await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${pinUserToken}`)
        .send({ originalUrl: "https://example.com/url-a" });
      urlAId = resA.body.data.id;

      // Create URL B (newer)
      const resB = await request(app)
        .post("/api/v1/urls")
        .set("Authorization", `Bearer ${pinUserToken}`)
        .send({ originalUrl: "https://example.com/url-b" });
      urlBId = resB.body.data.id;
    });

    it("should successfully pin a URL via PATCH with isPinned: true", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${urlAId}`)
        .set("Authorization", `Bearer ${pinUserToken}`)
        .send({ isPinned: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isPinned).toBe(true);
    });

    it("should sticky-hoist pinned URLs to the top of the list", async () => {
      // By default (createdAt desc), URL B would be first because it was created after URL A.
      // But because URL A is pinned, it MUST be hoisted to index 0!
      const res = await request(app)
        .get("/api/v1/urls")
        .set("Authorization", `Bearer ${pinUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].id).toBe(urlAId);
      expect(res.body.data[0].isPinned).toBe(true);
      expect(res.body.data[1].id).toBe(urlBId);
      expect(res.body.data[1].isPinned).toBe(false);
    });

    it("should filter by status=pinned and return only pinned URLs", async () => {
      const res = await request(app)
        .get("/api/v1/urls?status=pinned")
        .set("Authorization", `Bearer ${pinUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(urlAId);
      expect(res.body.pagination.total).toBe(1);
    });

    it("should successfully unpin a URL with isPinned: false", async () => {
      const res = await request(app)
        .patch(`/api/v1/urls/${urlAId}`)
        .set("Authorization", `Bearer ${pinUserToken}`)
        .send({ isPinned: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isPinned).toBe(false);

      const filterRes = await request(app)
        .get("/api/v1/urls?status=pinned")
        .set("Authorization", `Bearer ${pinUserToken}`);

      expect(filterRes.status).toBe(200);
      expect(filterRes.body.data.length).toBe(0);
      expect(filterRes.body.pagination.total).toBe(0);
    });
  });

  // Clean up database connection
  afterAll(async () => {
    await pool.end();
  });
});
