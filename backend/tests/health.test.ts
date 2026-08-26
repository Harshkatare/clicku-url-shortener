import request from "supertest";
import app from "../src/app.js";
import { describe, it, expect, TestRunner } from "vitest";
import { success } from "zod";

describe("Health Check API", () => {
  it("Should return 200 and confirm server is running", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "server is running",
    });
  });
});
