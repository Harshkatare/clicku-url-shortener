import crypto from "crypto";

import jwt from "jsonwebtoken";

import request from "supertest";

import { eq } from "drizzle-orm";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import app from "../src/app.js";

import { env } from "../src/config/env.js";

import { db, pool } from "../src/db/index.js";

import { users } from "../src/db/schema/users.js";

const userId = crypto.randomUUID();

const email = `cutoff_${Date.now()}@example.com`;

function signToken(iat?: number): string {
  return jwt.sign(
    {
      userId,
      ...(iat === undefined ? {} : { iat }),
    },
    env.JWT_SECRET,
    iat === undefined
      ? { noTimestamp: true }
      : { expiresIn: "15m" }
  );
}

async function setInvalidatedAt(
  value: Date | null
): Promise<void> {
  await db
    .update(users)
    .set({
      sessionsInvalidatedAt: value,
    })
    .where(eq(users.id, userId));
}

async function getMe(token: string) {
  return request(app)
    .get("/api/v1/auth/me")
    .set(
      "Authorization",
      `Bearer ${token}`
    );
}

describe("protect session cutoff", () => {
  beforeAll(async () => {
    await db.insert(users).values({
      id: userId,
      name: "Cutoff User",
      email,
    });
  });

  afterAll(async () => {
    await db
      .delete(users)
      .where(eq(users.id, userId));

    await pool.end();
  });

  it("allows a token issued after sessionsInvalidatedAt", async () => {
    const issuedAt = Math.floor(
      Date.now() / 1000
    );

    await setInvalidatedAt(
      new Date((issuedAt - 1) * 1000)
    );

    const res = await getMe(
      signToken(issuedAt)
    );

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
  });

  it("rejects a token issued before sessionsInvalidatedAt", async () => {
    const issuedAt = Math.floor(
      Date.now() / 1000
    );

    await setInvalidatedAt(
      new Date((issuedAt + 1) * 1000)
    );

    const res = await getMe(
      signToken(issuedAt)
    );

    expect(res.status).toBe(401);

    expect(res.body.success).toBe(
      false
    );

    expect(res.body.message).toBe(
      "Session has been revoked"
    );
  });

  it("fails closed when iat is missing", async () => {
    await setInvalidatedAt(new Date());

    const res = await getMe(signToken());

    expect(res.status).toBe(401);

    expect(res.body.message).toBe(
      "Session has been revoked"
    );
  });

  it("allows tokens when sessionsInvalidatedAt is null", async () => {
    await setInvalidatedAt(null);

    const res = await getMe(
      signToken(
        Math.floor(Date.now() / 1000)
      )
    );

    expect(res.status).toBe(200);
  });

  it("treats iat at the same second as valid", async () => {
    const issuedAt = Math.floor(
      Date.now() / 1000
    );

    await setInvalidatedAt(
      new Date(issuedAt * 1000)
    );

    const res = await getMe(
      signToken(issuedAt)
    );

    expect(res.status).toBe(200);
  });
});
