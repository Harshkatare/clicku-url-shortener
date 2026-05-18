import crypto from "crypto";

import { db } from "../../db/index.js";

import { urls } from "../../db/schema/urls.js";

import { generateShortCode } from "../../lib/generate-short-code.js";

import type { CreateUrlInput } from "./url.schema.js";

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