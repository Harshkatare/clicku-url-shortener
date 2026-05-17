import crypto from "crypto";

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateShortCode(
  length = 6
) {
  let shortCode = "";

  const randomBytes = crypto.randomBytes(
    length
  );

  for (let i = 0; i < length; i++) {
    const index =
      randomBytes[i] % CHARACTERS.length;

    shortCode += CHARACTERS[index];
  }

  return shortCode;
}