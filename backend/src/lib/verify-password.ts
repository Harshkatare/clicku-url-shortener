import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

export async function verifyPassword(
  password: string,
  storedHash: string
) {
  const [salt, key] = storedHash.split(":");

  const derivedKey = (await scryptAsync(
    password,
    salt,
    64
  )) as Buffer;

  const keyBuffer = Buffer.from(key, "hex");

  return crypto.timingSafeEqual(
    keyBuffer,
    derivedKey
  );
}