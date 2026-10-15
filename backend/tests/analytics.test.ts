import request from "supertest";
import app from "../src/app.js";
import { db, pool } from "../src/db/index.js";
import { users } from "../src/db/schema/users.js";
import { urls } from "../src/db/schema/urls.js";
import { clickEvents } from "../src/db/schema/click-events.js";
import { dailyUrlStats } from "../src/db/schema/daily-url-stats.js";
import { flushPendingClicks } from "../src/lib/telemetry/track-click.js";
import {
  runRollup,
  resetRollupStateForTest,
} from "../src/lib/telemetry/rollup-worker.js";
import { eq, desc, inArray } from "drizzle-orm";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Analytics API Integration Tests", () => {
  let tokenA = "";
  let userAId = "";
  const userAEmail = `analytics_user_a_${Date.now()}@example.com`;

  let tokenB = "";
  let userBId = "";
  const userBEmail = `analytics_user_b_${Date.now()}@example.com`;

  let url1Id = "";
  let url1ShortCode = "";

  let url2Id = "";
  let url2ShortCode = "";

  let emptyUrlId = "";
  let emptyUrlShortCode = "";

  let urlBId = "";
  let urlBShortCode = "";

  let workerUrlId = "";
  let workerShortCode = "";

  let rollupUrlId = "";
  let rollupShortCode = "";

  let boundaryDateUtc: Date;
  let utcDateStr: string;
  let kolkataDateStr: string;

  let event1Id = "";
  let event2Id = "";
  let event3Id = "";
  let event4Id = "";
  let event5Id = "";
  let event6Id = "";

  beforeAll(async () => {
    // 1. Create User A and User B
    const signupARes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Analytics User A",
        email: userAEmail,
        password: "password123",
      });
    tokenA = signupARes.body.data.token;

    const userARow = await db.query.users.findFirst({
      where: eq(users.email, userAEmail),
    });
    userAId = userARow!.id;

    const signupBRes = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Analytics User B",
        email: userBEmail,
        password: "password123",
      });
    tokenB = signupBRes.body.data.token;

    const userBRow = await db.query.users.findFirst({
      where: eq(users.email, userBEmail),
    });
    userBId = userBRow!.id;

    // 2. Create URLs for User A
    const url1Res = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ originalUrl: "https://example.com/analytics-target-1" });
    url1Id = url1Res.body.data.id;
    url1ShortCode = url1Res.body.data.shortCode;

    const url2Res = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ originalUrl: "https://example.com/analytics-target-2" });
    url2Id = url2Res.body.data.id;
    url2ShortCode = url2Res.body.data.shortCode;

    const emptyUrlRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ originalUrl: "https://example.com/analytics-empty-target" });
    emptyUrlId = emptyUrlRes.body.data.id;
    emptyUrlShortCode = emptyUrlRes.body.data.shortCode;

    const workerUrlRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ originalUrl: "https://example.com/worker-telemetry-target" });
    workerUrlId = workerUrlRes.body.data.id;
    workerShortCode = workerUrlRes.body.data.shortCode;

    const rollupUrlRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ originalUrl: "https://example.com/rollup-telemetry-target" });
    rollupUrlId = rollupUrlRes.body.data.id;
    rollupShortCode = rollupUrlRes.body.data.shortCode;

    // 3. Create URL for User B (for tenant isolation test)
    const urlBRes = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ originalUrl: "https://example.com/user-b-target" });
    urlBId = urlBRes.body.data.id;
    urlBShortCode = urlBRes.body.data.shortCode;

    // 4. Calculate deterministic date boundary (20:00 UTC 2 days ago shifts to 01:30 IST next day)
    boundaryDateUtc = new Date();
    boundaryDateUtc.setUTCDate(boundaryDateUtc.getUTCDate() - 2);
    boundaryDateUtc.setUTCHours(20, 0, 0, 0);

    utcDateStr = boundaryDateUtc.toISOString().slice(0, 10);
    const kolkataTime = new Date(
      boundaryDateUtc.getTime() + (5 * 60 + 30) * 60 * 1000
    );
    kolkataDateStr = kolkataTime.toISOString().slice(0, 10);

    // 5. Insert deterministic click events directly (bypassing async worker)
    const inserted1 = await db
      .insert(clickEvents)
      .values([
        // Event 1: 2 days ago, 20:00 UTC (human, IN, mobile, twitter.com)
        {
          urlId: url1Id,
          clickedAt: boundaryDateUtc,
          isBot: false,
          country: "IN",
          city: "Mumbai",
          deviceType: "Mobile",
          browser: "Chrome",
          os: "Android",
          referrer: "twitter.com",
          ipHash: "deterministic_hash_a1",
        },
        // Event 2: 1 hour ago (human, US, desktop, Direct)
        {
          urlId: url1Id,
          clickedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isBot: false,
          country: "US",
          city: "New York",
          deviceType: "Desktop",
          browser: "Firefox",
          os: "Windows",
          referrer: "Direct",
          ipHash: "deterministic_hash_a2",
        },
        // Event 3: 2 hours ago (bot, US, desktop, Direct)
        {
          urlId: url1Id,
          clickedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isBot: true,
          country: "US",
          city: "Ashburn",
          deviceType: "Desktop",
          browser: "Googlebot",
          os: "Linux",
          referrer: "Direct",
          ipHash: "deterministic_hash_bot_a",
        },
        // Event 4: 15 days ago (human, GB, tablet, linkedin.com)
        {
          urlId: url1Id,
          clickedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          isBot: false,
          country: "GB",
          city: "London",
          deviceType: "Tablet",
          browser: "Safari",
          os: "iOS",
          referrer: "linkedin.com",
          ipHash: "deterministic_hash_a3",
        },
        // Event 5: 89 days ago (human, DE, desktop, github.com) - per spec §9.2 row 3
        {
          urlId: url1Id,
          clickedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
          isBot: false,
          country: "DE",
          city: "Frankfurt",
          deviceType: "Desktop",
          browser: "Chrome",
          os: "Linux",
          referrer: "github.com",
          ipHash: "deterministic_hash_a4",
        },
        // Event 6: 95 days ago (human, CA, desktop, google.com) - boundary test outside 90d window
        {
          urlId: url1Id,
          clickedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
          isBot: false,
          country: "CA",
          city: "Toronto",
          deviceType: "Desktop",
          browser: "Chrome",
          os: "macOS",
          referrer: "google.com",
          ipHash: "deterministic_hash_a5",
        },
      ])
      .returning({ id: clickEvents.id });

    event1Id = inserted1[0].id;
    event2Id = inserted1[1].id;
    event3Id = inserted1[2].id;
    event4Id = inserted1[3].id;
    event5Id = inserted1[4].id;
    event6Id = inserted1[5].id;

    // 6. Insert click event for URL 2 (for overview aggregation test)
    await db.insert(clickEvents).values([
      {
        urlId: url2Id,
        clickedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isBot: false,
        country: "FR",
        city: "Paris",
        deviceType: "Desktop",
        browser: "Chrome",
        os: "macOS",
        referrer: "reddit.com",
        ipHash: "deterministic_hash_url2_1",
      },
    ]);
  });

  afterAll(async () => {
    await flushPendingClicks();
    await pool.end();
  });

  // 1. GET analytics for own URL (7d)
  it("should return analytics for owned URL within 7 days with status 200", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, dailyClicks, countries, referrers, devices, peakHours } =
      res.body.data;

    // Within 7 days: Event 1, Event 2, and Event 3 (bot) are included; Events 4 and 5 are outside window
    expect(summary.totalClicks).toBe(3);
    expect(summary.humanClicks).toBe(2);
    expect(summary.botClicks).toBe(1);
    expect(summary.uniqueVisitors).toBe(2);

    expect(dailyClicks.length).toBeLessThanOrEqual(7);
    const totalDailyClicks = dailyClicks.reduce(
      (acc: number, item: { clicks: number }) => acc + item.clicks,
      0
    );
    expect(totalDailyClicks).toBe(2); // Default includeBots=false

    expect(countries.length).toBe(2);
    expect(referrers.length).toBe(2);
    expect(devices.length).toBe(2);
    expect(peakHours.length).toBe(24);
  });

  // 2. GET analytics with days=30
  it("should return analytics with days=30 including 15-day-old event with status 200", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=30`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, dailyClicks } = res.body.data;
    expect(dailyClicks.length).toBeLessThanOrEqual(30);

    // Within 30 days: Events 1, 2, 3, and 4
    expect(summary.totalClicks).toBe(4);
    expect(summary.humanClicks).toBe(3);
    expect(summary.botClicks).toBe(1);
  });

  // 3. GET analytics with days=90
  it("should return analytics with days=90 including 89-day-old event and excluding >90d with status 200", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=90`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, dailyClicks } = res.body.data;
    expect(dailyClicks.length).toBeLessThanOrEqual(90);

    // Within 90 days: Events 1, 2, 3, 4, and 5 (Event 6 at 95d is excluded)
    expect(summary.totalClicks).toBe(5);
    expect(summary.humanClicks).toBe(4);
    expect(summary.botClicks).toBe(1);
  });

  // 4. GET analytics with invalid days=15 -> 400
  it("should return 400 Bad Request when invalid days range is provided", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=15`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. GET analytics with valid tz=Asia/Kolkata
  it("should shift daily dates and peak hours correctly with tz=Asia/Kolkata with status 200", async () => {
    const resUtc = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=7&tz=UTC`)
      .set("Authorization", `Bearer ${tokenA}`);

    const resIst = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=7&tz=Asia/Kolkata`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(resUtc.status).toBe(200);
    expect(resIst.status).toBe(200);

    // In UTC, Event 1 lands on utcDateStr at hour 20
    const utcDaily = resUtc.body.data.dailyClicks as Array<{
      date: string;
      clicks: number;
    }>;
    expect(utcDaily.some((d) => d.date === utcDateStr)).toBe(true);
    expect(resUtc.body.data.peakHours[20]).toBeGreaterThanOrEqual(1);

    // In Asia/Kolkata, Event 1 (+5h30m) lands on kolkataDateStr at hour 1
    const istDaily = resIst.body.data.dailyClicks as Array<{
      date: string;
      clicks: number;
    }>;
    expect(istDaily.some((d) => d.date === kolkataDateStr)).toBe(true);
    expect(resIst.body.data.peakHours[1]).toBeGreaterThanOrEqual(1);

    expect(utcDateStr).not.toBe(kolkataDateStr);
  });

  // 6. GET analytics with invalid tz=Fake/Zone -> 400
  it("should return 400 Bad Request with specific message for invalid IANA timezone", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?tz=Fake/Zone`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid IANA timezone");
  });

  // 7. GET analytics with includeBots=false (default)
  it("should exclude bot events from daily breakdown and humanClicks count when includeBots=false", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=7&includeBots=false`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.humanClicks).toBe(2);
    expect(res.body.data.summary.botClicks).toBe(1);

    const totalDailyClicks = res.body.data.dailyClicks.reduce(
      (acc: number, item: { clicks: number }) => acc + item.clicks,
      0
    );
    expect(totalDailyClicks).toBe(2);
  });

  // 8. GET analytics with includeBots=true
  it("should include bot events in daily breakdown when includeBots=true", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${url1Id}/analytics?days=7&includeBots=true`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalClicks).toBe(3);

    const totalDailyClicks = res.body.data.dailyClicks.reduce(
      (acc: number, item: { clicks: number }) => acc + item.clicks,
      0
    );
    expect(totalDailyClicks).toBe(3);
  });

  // 9. Tenant isolation: User A gets analytics for User B's URL -> 404
  it("should return 404 Not Found when attempting to access another user's URL analytics", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${urlBId}/analytics`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("URL not found");
  });

  // 10. GET overview analytics
  it("should return overview analytics aggregating across all owned URLs with status 200", async () => {
    const res = await request(app)
      .get("/api/v1/analytics/overview?days=7")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, topUrls } = res.body.data;
    // URL 1 has 2 human clicks in 7d; URL 2 has 1 human click in 7d -> total 3 human clicks
    expect(summary.humanClicks).toBe(3);
    expect(summary.botClicks).toBe(1);
    expect(summary.totalClicks).toBe(4);

    expect(Array.isArray(topUrls)).toBe(true);
    expect(topUrls.length).toBeGreaterThanOrEqual(2);
    expect(topUrls[0].id).toBe(url1Id);
    expect(topUrls[0].clicks).toBe(2);
    expect(topUrls[1].id).toBe(url2Id);
    expect(topUrls[1].clicks).toBe(1);

    expect(Array.isArray(res.body.data.dailyClicks)).toBe(true);
    expect(Array.isArray(res.body.data.countries)).toBe(true);
    expect(Array.isArray(res.body.data.referrers)).toBe(true);
    expect(Array.isArray(res.body.data.devices)).toBe(true);
    expect(Array.isArray(res.body.data.peakHours)).toBe(true);
    expect(res.body.data.peakHours.length).toBe(24);
  });

  // 11. GET analytics for URL with zero events
  it("should return empty arrays and zero counts for URL with no click events", async () => {
    const res = await request(app)
      .get(`/api/v1/urls/${emptyUrlId}/analytics`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, dailyClicks, countries, referrers, devices, peakHours } =
      res.body.data;

    expect(summary.totalClicks).toBe(0);
    expect(summary.humanClicks).toBe(0);
    expect(summary.botClicks).toBe(0);
    expect(summary.uniqueVisitors).toBe(0);

    expect(dailyClicks).toEqual([]);
    expect(countries).toEqual([]);
    expect(referrers).toEqual([]);
    expect(devices).toEqual([]);
    expect(peakHours).toEqual(new Array(24).fill(0));
  });

  // 12. GET analytics without auth -> 401
  it("should return 401 Unauthorized when requesting analytics without authentication", async () => {
    const resPerUrl = await request(app).get(
      `/api/v1/urls/${url1Id}/analytics`
    );
    expect(resPerUrl.status).toBe(401);
    expect(resPerUrl.body.success).toBe(false);
    expect(resPerUrl.body.message).toBe("Unauthorized");

    const resOverview = await request(app).get("/api/v1/analytics/overview");
    expect(resOverview.status).toBe(401);
    expect(resOverview.body.success).toBe(false);
    expect(resOverview.body.message).toBe("Unauthorized");
  });

  // 13. Worker redirect: GET /:slug triggers async trackClickAsync and writes row
  it("should record click event asynchronously on redirect and populate geoip and headers", async () => {
    const res = await request(app)
      .get(`/${workerShortCode}`)
      .set("x-forwarded-for", "8.8.8.8")
      .set(
        "user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      )
      .set("referer", "https://twitter.com/post/100");

    expect(res.status).toBe(302);

    // Drain background asynchronous tracking pipeline deterministically
    await flushPendingClicks();

    const events = await db
      .select()
      .from(clickEvents)
      .where(eq(clickEvents.urlId, workerUrlId));

    expect(events.length).toBe(1);
    const recorded = events[0];
    expect(recorded.isBot).toBe(false);
    expect(recorded.country).toBe("US");
    expect(recorded.deviceType).toBe("Desktop");
    expect(recorded.browser).toBe("Chrome");
    expect(recorded.referrer).toBe("twitter.com");
    expect(typeof recorded.ipHash).toBe("string");
  });

  // 14. Worker bot flag: Googlebot UA sets is_bot = true
  it("should mark is_bot = true when redirected with Googlebot User-Agent", async () => {
    const res = await request(app)
      .get(`/${workerShortCode}`)
      .set(
        "user-agent",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      );

    expect(res.status).toBe(302);

    await flushPendingClicks();

    const events = await db
      .select()
      .from(clickEvents)
      .where(eq(clickEvents.urlId, workerUrlId))
      .orderBy(desc(clickEvents.clickedAt), desc(clickEvents.id));

    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0].isBot).toBe(true);
    expect(events.some((e) => e.isBot === true)).toBe(true);
  });

  // 15. Worker bot flag: Slackbot UA sets is_bot = true
  it("should mark is_bot = true when redirected with Slackbot User-Agent", async () => {
    const res = await request(app)
      .get(`/${workerShortCode}`)
      .set(
        "user-agent",
        "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)"
      );

    expect(res.status).toBe(302);

    await flushPendingClicks();

    const events = await db
      .select()
      .from(clickEvents)
      .where(eq(clickEvents.urlId, workerUrlId))
      .orderBy(desc(clickEvents.clickedAt), desc(clickEvents.id));

    expect(events.length).toBeGreaterThanOrEqual(3);
    expect(events[0].isBot).toBe(true);
    expect(events.filter((e) => e.isBot === true).length).toBeGreaterThanOrEqual(2);
  });

  // 16. Rollup worker: force runs aggregate >90d events into daily_url_stats and purges them
  it("should aggregate events older than 90 days into daily_url_stats and delete them from click_events", async () => {
    const oldDate95d = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000);
    const recentDate5d = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const oldRows = await db
      .insert(clickEvents)
      .values([
        {
          urlId: rollupUrlId,
          clickedAt: oldDate95d,
          isBot: false,
          country: "IN",
          deviceType: "Mobile",
          referrer: "Direct",
          ipHash: "hash_rollup_old_1",
        },
        {
          urlId: rollupUrlId,
          clickedAt: oldDate95d,
          isBot: false,
          country: "IN",
          deviceType: "Mobile",
          referrer: "Direct",
          ipHash: "hash_rollup_old_2",
        },
      ])
      .returning({ id: clickEvents.id });

    const recentRows = await db
      .insert(clickEvents)
      .values([
        {
          urlId: rollupUrlId,
          clickedAt: recentDate5d,
          isBot: false,
          country: "FR",
          deviceType: "Desktop",
          referrer: "Direct",
          ipHash: "hash_rollup_recent_1",
        },
      ])
      .returning({ id: clickEvents.id });

    const oldIds = oldRows.map((r) => r.id);
    const recentId = recentRows[0].id;

    // Execute retention rollup worker forcefully with 90-day threshold
    const rollupResult = await runRollup({ force: true, olderThanDays: 90 });

    expect(rollupResult.skipped).toBe(false);
    expect(rollupResult.rolledUpRows).toBeGreaterThanOrEqual(1);
    expect(rollupResult.deletedRows).toBeGreaterThanOrEqual(2);

    // Verify daily_url_stats table contains rolled up summary
    const stats = await db
      .select()
      .from(dailyUrlStats)
      .where(eq(dailyUrlStats.urlId, rollupUrlId));

    expect(stats.length).toBeGreaterThanOrEqual(1);
    expect(stats[0].totalClicks).toBeGreaterThanOrEqual(2);
    expect(stats[0].uniqueVisitors).toBeGreaterThanOrEqual(2);

    // Verify old events are purged from click_events
    const purgedEvents = await db
      .select()
      .from(clickEvents)
      .where(inArray(clickEvents.id, oldIds));
    expect(purgedEvents.length).toBe(0);

    // Verify recent event is preserved in click_events
    const survivingEvents = await db
      .select()
      .from(clickEvents)
      .where(eq(clickEvents.id, recentId));
    expect(survivingEvents.length).toBe(1);

    resetRollupStateForTest();
  });
});
