import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import { urls } from "../../db/schema/urls.js";
import { hashPassword } from "../../lib/hash-password.js";
import { verifyPassword } from "../../lib/verify-password.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors/index.js";

import type {
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
} from "./user.schema.js";

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const normalizedEmail = data.email.toLowerCase();

  if (normalizedEmail !== existingUser.email.toLowerCase()) {
    const emailConflict = await db.query.users.findFirst({
      where: and(
        eq(users.email, normalizedEmail),
        ne(users.id, userId)
      ),
    });

    if (emailConflict) {
      throw new ConflictError("Email already in use");
    }
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      name: data.name,
      email: normalizedEmail,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return updatedUser;
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await verifyPassword(
    data.currentPassword,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Incorrect current password");
  }

  const newHash = await hashPassword(data.newPassword);

  await db
    .update(users)
    .set({
      passwordHash: newHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { message: "Password updated successfully" };
}

export async function deleteAccount(userId: string, data: DeleteAccountInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isPasswordValid = await verifyPassword(
    data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Incorrect password");
  }

  await db.delete(users).where(eq(users.id, userId));

  return { message: "Account deleted successfully" };
}

export async function exportUserData(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const userUrls = await db.query.urls.findMany({
    where: eq(urls.userId, userId),
    orderBy: desc(urls.createdAt),
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    urls: userUrls.map((u) => ({
      id: u.id,
      shortCode: u.shortCode,
      originalUrl: u.originalUrl,
      customAlias: u.customAlias,
      status: u.status,
      isPinned: u.isPinned,
      sortOrder: u.sortOrder,
      clicks: u.clicks,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
    exportedAt: new Date().toISOString(),
  };
}
