import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateToken(userId: string) {
  return jwt.sign(
    { userId },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}