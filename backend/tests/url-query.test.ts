import { describe, it, expect } from "vitest";
import { urlQuerySchema } from "../src/modules/url/url.schema.js";

describe("URL Query Validation Schema Tests", () => {
  it("should apply default values when query object is empty", () => {
    const result = urlQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        search: undefined,
        status: "all",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortDir: "desc",
      });
    }
  });

  it("should coerce string page and limit parameters to integers", () => {
    const query = {
      page: "3",
      limit: "25",
    };
    const result = urlQuerySchema.safeParse(query);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(25);
    }
  });

  it("should reject non-positive or non-integer page numbers", () => {
    const invalidPages = [0, -1, 1.5, "abc"];
    for (const page of invalidPages) {
      const result = urlQuerySchema.safeParse({ page });
      expect(result.success).toBe(false);
    }
  });

  it("should reject limit values exceeding 50 or non-positive integers", () => {
    const invalidLimits = [0, -5, 51, 100, 10.5, "xyz"];
    for (const limit of invalidLimits) {
      const result = urlQuerySchema.safeParse({ limit });
      expect(result.success).toBe(false);
    }
  });

  it("should sanitize search input and convert empty strings to undefined", () => {
    const trimmedResult = urlQuerySchema.safeParse({ search: "  my search term  " });
    expect(trimmedResult.success).toBe(true);
    if (trimmedResult.success) {
      expect(trimmedResult.data.search).toBe("my search term");
    }

    const emptyResult = urlQuerySchema.safeParse({ search: "" });
    expect(emptyResult.success).toBe(true);
    if (emptyResult.success) {
      expect(emptyResult.data.search).toBeUndefined();
    }

    const whitespaceResult = urlQuerySchema.safeParse({ search: "   " });
    expect(whitespaceResult.success).toBe(true);
    if (whitespaceResult.success) {
      expect(whitespaceResult.data.search).toBeUndefined();
    }
  });

  it("should reject search query strings exceeding 100 characters", () => {
    const longSearch = "a".repeat(101);
    const result = urlQuerySchema.safeParse({ search: longSearch });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed 100 characters");
    }
  });

  it("should accept valid status, sortBy, and sortDir enums", () => {
    const validPayload = {
      status: "active",
      sortBy: "clicks",
      sortDir: "asc",
    };
    const result = urlQuerySchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
      expect(result.data.sortBy).toBe("clicks");
      expect(result.data.sortDir).toBe("asc");
    }
  });

  it("should reject invalid status, sortBy, or sortDir enum values", () => {
    expect(urlQuerySchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(urlQuerySchema.safeParse({ sortBy: "unknown_column" }).success).toBe(false);
    expect(urlQuerySchema.safeParse({ sortDir: "ascending" }).success).toBe(false);
  });
});
