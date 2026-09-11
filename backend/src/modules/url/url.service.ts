import crypto from "crypto";

import { db } from "../../db/index.js";

import { urls } from "../../db/schema/urls.js";

import { generateShortCode } from "../../lib/generate-short-code.js";

import type { CreateUrlInput, updateUrlInput } from "./url.schema.js";

import { AppError, NotFoundError, ConflictError } from "../../lib/errors/index.js";

import { eq, sql, desc, and, or } from "drizzle-orm";

const MAX_COLLISION_RETRIES = 5;

export async function createShortUrl(
  data: CreateUrlInput,
  userId: string | null = null
) {
  for (let attempt = 1; attempt <= MAX_COLLISION_RETRIES; attempt++) {
    const shortCode = generateShortCode();
    const urlId = crypto.randomUUID();

    try {
      const [createdUrl] = await db
        .insert(urls)
        .values({
          id: urlId,
          userId,
          originalUrl: data.originalUrl,
          shortCode,
          customAlias: data.customAlias || null,
          status: data.status ?? "active",
        })
        .returning();

      return createdUrl;
    } catch (error: any) {
      const pgError = error?.cause || error;
      const code = pgError?.code || error?.code;
      const isUniqueViolation =
        code === "23505" || error?.message?.includes("unique constraint");

      if (isUniqueViolation) {
        const isCustomAliasViolation =
          Boolean(data.customAlias) &&
          (pgError?.constraint === "urls_custom_alias_unique" ||
            pgError?.detail?.includes("custom_alias") ||
            error?.message?.includes("urls_custom_alias_unique") ||
            error?.message?.includes("custom_alias"));

        if (isCustomAliasViolation) {
          throw new ConflictError("Custom alias already in use");
        }
        if (attempt < MAX_COLLISION_RETRIES) {
          continue;
        }
      }
      throw error;
    }
  }

  throw new AppError(
    "Failed to generate a unique short URL. Please try again.",
    500
  );
}

export async function redirectToOriginalUrl(slug: string) {
  const existingUrl = await db.query.urls.findFirst({
    where: or(eq(urls.shortCode, slug), eq(urls.customAlias, slug)),
  });

  if (!existingUrl) {
    throw new NotFoundError(
      "Short URL not found"
    );
  }

  await db
    .update(urls)
    .set({
      clicks: sql`${urls.clicks} + 1`,
    })
    .where(eq(urls.id, existingUrl.id));

  return existingUrl.originalUrl;
}

export async function getUserUrls(userId: string) {
  const userUrls = await db.query.urls.findMany({
    where: eq(urls.userId, userId),

    orderBy: desc(urls.createdAt),
  });

  return userUrls;
}

export async function deleteUrl(
  urlId: string,
  userId: string
) {
  const deletedUrls = await db
    .delete(urls)
    .where(
      and(
        eq(urls.id, urlId),
        eq(urls.userId, userId)
      )
    )
    .returning();

  const deletedUrl = deletedUrls[0];

  if (!deletedUrl) {
    throw new NotFoundError(
      "URL not found or unauthorized"
    );
  }

  return deletedUrl;
}

export async function updateUrl(
  urlId: string,
  userId: string,
  data: updateUrlInput
) {
  const updatedUrls = await db
    .update(urls)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(urls.id, urlId),
        eq(urls.userId, userId)
      )
    )
    .returning();

  const updatedUrl = updatedUrls[0];

  if (!updatedUrl) {
    throw new NotFoundError(
      "URL not found or unauthorized"
    );
  }

  return updatedUrl;
}

export async function claimUrl(shortCode: string, userId: string) {
  const existingUrl = await db.query.urls.findFirst({
    where: eq(urls.shortCode, shortCode),
  });

  if (!existingUrl) {
    throw new NotFoundError("Short URL not found");
  }

  // Idempotency: already owned by this user
  if (existingUrl.userId === userId) {
    return existingUrl;
  }

  // Anti-hijack: already claimed by another user
  if (existingUrl.userId !== null) {
    throw new ConflictError("This short link has already been claimed by another user");
  }

  // Atomically claim the guest URL
  const [updatedUrl] = await db
    .update(urls)
    .set({
      userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(urls.id, existingUrl.id),
        sql`${urls.userId} IS NULL`
      )
    )
    .returning();

  if (!updatedUrl) {
    throw new ConflictError("This short link has already been claimed by another user");
  }

  return updatedUrl;
}