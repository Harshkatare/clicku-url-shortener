import crypto from "crypto";

import { db } from "../../db/index.js";

import { urls } from "../../db/schema/urls.js";

import { generateShortCode } from "../../lib/generate-short-code.js";

import type { CreateUrlInput } from "./url.schema.js";

import { eq, sql } from "drizzle-orm";

export async function createShortUrl(
  data: CreateUrlInput,
  userId: string
) {
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

export async function redirectToOriginalUrl(
  shortCode: string
) {
  const existingUrl =
    await db.query.urls.findFirst({
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