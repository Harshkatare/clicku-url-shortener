import { describe, it, expect } from "vitest";
import { customAliasSchema, createUrlSchema, RESERVED_SLUGS } from "../src/modules/url/url.schema.js";

describe("Vanity Custom Alias & Reserved Slugs Schema Tests", () => {
  it("should accept valid alphanumeric and hyphenated custom aliases", () => {
    const validAliases = ["my-link", "custom_slug", "brand2026", "ShortLink", "abc"];
    for (const alias of validAliases) {
      const result = customAliasSchema.safeParse(alias);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(alias);
      }
    }
  });

  it("should reject aliases shorter than 3 characters", () => {
    const result = customAliasSchema.safeParse("ab");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 3 characters");
    }
  });

  it("should reject aliases longer than 30 characters", () => {
    const longAlias = "a".repeat(31);
    const result = customAliasSchema.safeParse(longAlias);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed 30 characters");
    }
  });

  it("should reject aliases containing invalid symbols or spaces", () => {
    const invalidAliases = ["my link", "slug!", "alias@domain", "foo.bar", "test$"];
    for (const alias of invalidAliases) {
      const result = customAliasSchema.safeParse(alias);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Only letters, numbers, hyphens, and underscores");
      }
    }
  });

  it("should reject reserved slugs case-insensitively", () => {
    const reservedSamples = ["dashboard", "DASHBOARD", "Login", "register", "API", "health", "faq"];
    for (const slug of reservedSamples) {
      const result = customAliasSchema.safeParse(slug);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("reserved for system use");
      }
    }
  });

  it("should validate createUrlSchema with customAlias and status default", () => {
    const validPayload = {
      originalUrl: "https://example.com/some/path",
      customAlias: "my-cool-url",
    };

    const result = createUrlSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.originalUrl).toBe("https://example.com/some/path");
      expect(result.data.customAlias).toBe("my-cool-url");
      expect(result.data.status).toBe("active");
    }
  });

  it("should reject createUrlSchema when customAlias uses a reserved slug", () => {
    const invalidPayload = {
      originalUrl: "https://example.com",
      customAlias: "dashboard",
    };

    const result = createUrlSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("reserved for system use");
    }
  });
});
