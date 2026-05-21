import crypto from "crypto";

import { db } from "../../db/index.js";

import { urls } from "../../db/schema/urls.js";

import { generateShortCode } from "../../lib/generate-short-code.js";

import type { CreateUrlInput } from "./url.schema.js";

import { eq, sql, desc, and } from "drizzle-orm";
import { url } from "inspector";

export async function createShortUrl(data: CreateUrlInput, userId: string) {
  const shortCode = generateShortCode();

  const urlId = crypto.randomUUID();

  const [createdUrl] = await db
    .insert(urls)
    .values({
      id: urlId,
      userId,
      originalUrl: data.originalUrl,
      shortCode,
    })
    .returning();

  return createdUrl;
}

export async function redirectToOriginalUrl(shortCode: string) {
  const existingUrl = await db.query.urls.findFirst({
    where: eq(urls.shortCode, shortCode),
  });

  if (!existingUrl) {
    throw new Error("Short URL not found");
  }

  await db
    .update(urls)
    .set({
      clicks: sql`${urls.clicks} + 1`,
      updatedAt: new Date(),
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
    throw new Error(
      "URL not found or unauthorized"
    );
  }

  return deletedUrl;
}
