import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { Request } from "express";
import geoip from "geoip-lite";
import { isbot } from "isbot";
import { UAParser } from "ua-parser-js";

export interface TelemetryPayload {
  isBot: boolean;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  ipHash: string | null;
  referrer: string;
}

/**
 * Extracts clean domain from referer/referrer header.
 * Non-throwing fallback returning "Direct" on missing, malformed, or relative URLs.
 */
export function extractReferrerDomain(header?: string | string[]): string {
  if (!header || typeof header !== "string") {
    return "Direct";
  }
  try {
    const parsed = new URL(header);
    const hostname = parsed.hostname.replace(/^www\./, "").trim();
    return hostname || "Direct";
  } catch {
    return "Direct";
  }
}

/**
 * Parses request headers for analytics telemetry.
 * Ephemeral raw IP is used solely in-memory for GeoIP resolution and daily-salted SHA-256
 * hashing, then immediately discarded. Raw IPs and user-agent strings are never stored.
 */
export function parseTelemetry(req: Request): TelemetryPayload {
  const rawUserAgent = req.headers["user-agent"];
  const userAgent =
    typeof rawUserAgent === "string"
      ? rawUserAgent
      : Array.isArray(rawUserAgent) && typeof rawUserAgent[0] === "string"
        ? rawUserAgent[0]
        : "";
  const botDetected = isbot(userAgent);

  const parser = new UAParser(userAgent);
  const uaResult = parser.getResult();

  let deviceType: string | null = "Desktop";
  if (uaResult.device.type) {
    const rawType = uaResult.device.type.toLowerCase();
    deviceType = rawType.charAt(0).toUpperCase() + rawType.slice(1);
  } else if (!userAgent) {
    deviceType = null;
  }

  const browser = uaResult.browser.name || null;
  const os = uaResult.os.name || null;

  // Defensive client IP extraction (Gate 2: x-forwarded-for[0] primary with req.ip fallback)
  const forwarded = req.headers["x-forwarded-for"];
  let rawIp: string | null = null;

  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    const candidate = forwarded.split(",")[0].trim().replace(/^::ffff:/, "");
    if (isIP(candidate)) {
      rawIp = candidate;
    }
  } else if (Array.isArray(forwarded) && forwarded.length > 0 && typeof forwarded[0] === "string") {
    const candidate = forwarded[0].split(",")[0].trim().replace(/^::ffff:/, "");
    if (isIP(candidate)) {
      rawIp = candidate;
    }
  }

  // Fall through to req.ip if forwarded header was absent or contained invalid IP
  if (!rawIp && typeof req.ip === "string") {
    const candidate = req.ip.replace(/^::ffff:/, "").trim();
    if (isIP(candidate)) {
      rawIp = candidate;
    }
  }

  // GeoIP lookup in-memory (raw IP discarded afterward)
  let country: string | null = null;
  let city: string | null = null;

  if (rawIp) {
    const geo = geoip.lookup(rawIp);
    country = geo?.country || null;
    city = geo?.city?.trim() || null; // Gate 1: normalize empty strings to null
  }

  // Daily-salted SHA-256 IP hash (prevents cross-day tracking, zero raw IP retention)
  let ipHash: string | null = null;
  if (rawIp) {
    const dailySalt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
    ipHash = createHash("sha256")
      .update(rawIp + dailySalt)
      .digest("hex");
  }

  const refererHeader = req.headers["referer"] || req.headers["referrer"];
  const referrer = extractReferrerDomain(refererHeader);

  return {
    isBot: botDetected,
    deviceType,
    browser,
    os,
    country,
    city,
    ipHash,
    referrer,
  };
}
