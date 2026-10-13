import type { Request } from "express";
import { db } from "../../db/index.js";
import { clickEvents } from "../../db/schema/click-events.js";
import { logger } from "../logger.js";
import { parseTelemetry } from "./parse-telemetry.js";

export const MAX_INFLIGHT = 50;

let inflightCount = 0;
const pendingClicks = new Set<Promise<void>>();

export interface TrackClickPayload {
  urlId: string;
  req: Request;
}

/**
 * Returns current number of in-flight click tracking operations.
 */
export function getInflightCount(): number {
  return inflightCount;
}

/**
 * Awaits completion of all currently pending click tracking operations.
 * Used for test suites and graceful draining.
 */
export async function flushPendingClicks(): Promise<void> {
  while (pendingClicks.size > 0) {
    await Promise.allSettled(Array.from(pendingClicks));
  }
}

/**
 * Resets concurrency counters for test isolation.
 */
export function resetInflightForTest(): void {
  inflightCount = 0;
  pendingClicks.clear();
}

/**
 * Records a click event asynchronously in the click_events table.
 * Runs off the redirect path with backpressure limiting and error isolation.
 */
export async function trackClickAsync(payload: TrackClickPayload): Promise<void>;
export async function trackClickAsync(urlId: string, req: Request): Promise<void>;
export async function trackClickAsync(
  payloadOrUrlId: TrackClickPayload | string,
  reqArg?: Request
): Promise<void> {
  const urlId =
    typeof payloadOrUrlId === "string" ? payloadOrUrlId : payloadOrUrlId.urlId;
  const req =
    typeof payloadOrUrlId === "string" ? reqArg! : payloadOrUrlId.req;

  if (inflightCount >= MAX_INFLIGHT) {
    logger.warn("Click tracking backpressure, dropping event");
    return;
  }

  inflightCount++;

  const taskPromise = (async () => {
    try {
      const telemetry = parseTelemetry(req);

      await db.insert(clickEvents).values({
        urlId,
        isBot: telemetry.isBot,
        deviceType: telemetry.deviceType,
        browser: telemetry.browser,
        os: telemetry.os,
        country: telemetry.country,
        city: telemetry.city,
        ipHash: telemetry.ipHash,
        referrer: telemetry.referrer,
      });
    } catch (err) {
      logger.error({ err, urlId }, "Click tracking failed");
    } finally {
      inflightCount--;
    }
  })();

  pendingClicks.add(taskPromise);
  taskPromise.finally(() => {
    pendingClicks.delete(taskPromise);
  });

  return taskPromise;
}
