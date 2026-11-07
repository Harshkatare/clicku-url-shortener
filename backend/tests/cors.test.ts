import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect } from "vitest";

describe("CORS policy", () => {
  it("reflects the canonical www origin with credentials", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://www.shortlynk.in");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://www.shortlynk.in"
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does not emit an allow-origin header for an unlisted origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://evil.example");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
