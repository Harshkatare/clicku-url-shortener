import crypto from "crypto";

import { db } from "../../db/index.js";

import { urls } from "../../db/schema/urls.js";

import { generateShortCode } from "../../lib/generate-short-code.js";

import type {
  CreateUrlInput,
  updateUrlInput,
  UrlQueryInput,
} from "./url.schema.js";

import { AppError, NotFoundError, ConflictError } from "../../lib/errors/index.js";

import { eq, sql, desc, asc, and, or, ilike, not, gt, gte, lt, lte } from "drizzle-orm";

const MAX_COLLISION_RETRIES = 5;

const DEFAULT_QUERY: UrlQueryInput = {
  search: undefined,
  page: 1,
  limit: 10,
  status: "all",
  sortBy: "createdAt",
  sortDir: "desc",
};

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

function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export async function getUserUrls(
  userId: string,
  query: UrlQueryInput = DEFAULT_QUERY
) {
  const conditions = [eq(urls.userId, userId)];

  if (query.status && query.status !== "all") {
    if (query.status === "pinned") {
      conditions.push(eq(urls.isPinned, true));
    } else {
      conditions.push(eq(urls.status, query.status));
    }
  }

  if (query.search) {
    const sanitizedSearch = escapeLikePattern(query.search);
    const searchPattern = `%${sanitizedSearch}%`;
    const searchClause = or(
      ilike(urls.originalUrl, searchPattern),
      ilike(urls.shortCode, searchPattern),
      ilike(urls.customAlias, searchPattern)
    );

    if (searchClause) {
      conditions.push(searchClause);
    }
  }

  let sortColumn;
  switch (query.sortBy) {
    case "clicks":
      sortColumn = urls.clicks;
      break;
    case "sortOrder":
      sortColumn = urls.sortOrder;
      break;
    case "createdAt":
    default:
      sortColumn = urls.createdAt;
      break;
  }

  const orderExpression =
    query.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

  const offset = (query.page - 1) * query.limit;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(urls)
      .where(and(...conditions))
      .orderBy(desc(urls.isPinned), orderExpression)
      .limit(query.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(urls)
      .where(and(...conditions)),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / query.limit);

  return {
    data,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    },
  };
}

export async function getUserUrlStats(userId: string) {
  const [result] = await db
    .select({
      totalUrls: sql<number>`count(*)::int`,
      totalClicks: sql<number>`coalesce(sum(${urls.clicks}), 0)::int`,
      activeLinks: sql<number>`count(*) filter (where ${urls.status} = 'active')::int`,
      expiringLinks: sql<number>`count(*) filter (where ${urls.status} = 'expiring')::int`,
      archivedLinks: sql<number>`count(*) filter (where ${urls.status} = 'archived')::int`,
    })
    .from(urls)
    .where(eq(urls.userId, userId));

  const totalUrls = result?.totalUrls ?? 0;
  const totalClicks = result?.totalClicks ?? 0;
  const activeLinks = result?.activeLinks ?? 0;
  const expiringLinks = result?.expiringLinks ?? 0;
  const archivedLinks = result?.archivedLinks ?? 0;
  const avgClicksPerLink =
    totalUrls > 0 ? Number((totalClicks / totalUrls).toFixed(1)) : 0;

  return {
    totalUrls,
    totalClicks,
    activeLinks,
    expiringLinks,
    archivedLinks,
    avgClicksPerLink,
  };
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
  if (data.customAlias) {
    const conflicting = await db.query.urls.findFirst({
      where: and(
        or(
          eq(urls.shortCode, data.customAlias),
          eq(urls.customAlias, data.customAlias)
        ),
        not(eq(urls.id, urlId))
      ),
    });

    if (conflicting) {
      throw new ConflictError("Custom alias already in use");
    }
  }

  try {
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
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    const pgError = error?.cause || error;
    const code = pgError?.code || error?.code;
    const isUniqueViolation =
      code === "23505" || error?.message?.includes("unique constraint");

    if (isUniqueViolation) {
      throw new ConflictError("Custom alias already in use");
    }
    throw error;
  }
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

export async function reorderUrl(
  urlId: string,
  userId: string,
  newSortOrder: number
) {
  return await db.transaction(async (tx) => {
    const existingUrl = await tx.query.urls.findFirst({
      where: and(eq(urls.id, urlId), eq(urls.userId, userId)),
    });

    if (!existingUrl) {
      throw new NotFoundError("URL not found or unauthorized");
    }

    const oldSortOrder = existingUrl.sortOrder;
    if (oldSortOrder === newSortOrder) {
      return existingUrl;
    }

    if (oldSortOrder < newSortOrder) {
      // Moving down: shift intervening items UP by 1
      await tx
        .update(urls)
        .set({
          sortOrder: sql`${urls.sortOrder} - 1`,
        })
        .where(
          and(
            eq(urls.userId, userId),
            gt(urls.sortOrder, oldSortOrder),
            lte(urls.sortOrder, newSortOrder)
          )
        );
    } else {
      // Moving up: shift intervening items DOWN by 1
      await tx
        .update(urls)
        .set({
          sortOrder: sql`${urls.sortOrder} + 1`,
        })
        .where(
          and(
            eq(urls.userId, userId),
            gte(urls.sortOrder, newSortOrder),
            lt(urls.sortOrder, oldSortOrder)
          )
        );
    }

    const [updatedUrl] = await tx
      .update(urls)
      .set({
        sortOrder: newSortOrder,
        updatedAt: new Date(),
      })
      .where(and(eq(urls.id, urlId), eq(urls.userId, userId)))
      .returning();

    return updatedUrl;
  });
}