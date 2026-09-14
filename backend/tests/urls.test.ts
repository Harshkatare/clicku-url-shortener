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

  // 5. Test Updating the URL
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

  // 6. Test Updating with Empty Body (400 Bad Request)
  it("should return 400 Bad Request when updating with an empty body", async () => {
    const res = await request(app)
      .patch(`/api/v1/urls/${createdUrlId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
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

  // Clean up database connection
  afterAll(async () => {
    await pool.end();
  });
});
