import crypto from "crypto";

import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";

import { eq } from "drizzle-orm";

import { hashPassword } from "../../lib/hash-password.js";
import { verifyPassword } from "../../lib/verify-password.js";

import { generateToken } from "../../lib/generate-token.js";

import type { SignupInput, LoginInput } from "./auth.schema.js";

export async function signup(data: SignupInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(
    data.password
  );

  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
  });

  const token = generateToken(userId);

  return {
    token,
  };
}

export async function login(data: LoginInput) {
  const existingUser =
    await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

  if (!existingUser) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid =
    await verifyPassword(
      data.password,
      existingUser.passwordHash
    );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(
    existingUser.id
  );

  return {
    token,
  };
}