import { LegalPageLayout, type TocItem } from "../layouts/LegalPageLayout";
import { SUPPORT_EMAIL } from "../config/constants";

const PRIVACY_TOC: TocItem[] = [
  { id: "core-principles", label: "Core Principles" },
  { id: "data-collection", label: "Data We Collect" },
  { id: "telemetry", label: "Click Telemetry Mechanics" },
  { id: "retention", label: "Data Retention & Lifecycle" },
  { id: "user-rights", label: "User Rights & Data Portability" },
  { id: "subprocessors", label: "Subprocessors & Infrastructure" },
  { id: "modifications", label: "Policy Changes" },
  { id: "contact", label: "Contact Us" },
];

export function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="October 2026"
      tocItems={PRIVACY_TOC}
      seeAlso={{ label: "Terms of Service", to: "/terms" }}
    >
      {/* 1. Core Principles */}
      <section id="core-principles" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          1. Core Privacy Principles
        </h2>

        {/* Commitment Callout Card */}
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-4.5 dark:border-emerald-500/20 dark:bg-emerald-950/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Our Baseline Commitments
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              <span><strong>Zero data sales:</strong> We do not sell, rent, monetize, or trade user data or visitor telemetry with advertisers or third parties.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              <span><strong>No tracking cookies:</strong> ShortLynk uses zero cross-site advertising pixels, behavioral trackers, or third-party profiling cookies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓</span>
              <span><strong>Ephemeral visitor processing:</strong> Visitor IP addresses are hashed using a daily-rotated salt and never stored in raw form.</span>
            </li>
          </ul>
        </div>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 2. Data Collection */}
      <section id="data-collection" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          2. Data We Collect and Store
        </h2>
        <p className="mt-3">
          We collect only information necessary to provide URL shortening, link management, and aggregate performance analytics.
        </p>

        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
          A. Account Data (Registered Users)
        </h3>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Credentials:</strong> Name and email address. Passwords are protected using scrypt with unique salts; plaintext passwords are never stored.</li>
          <li><strong>Session tokens:</strong> Cryptographically signed JWT tokens stored in browser local storage.</li>
          <li><strong>Link records:</strong> Original destination URLs, custom slugs, title tags, link status (active, expiring, or archived), and pinned state.</li>
        </ul>

        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
          B. Redirect Telemetry (Visitors)
        </h3>
        <p className="mt-2">
          When a visitor clicks a ShortLynk shortlink, we process the incoming HTTP request in memory to generate aggregate analytics for the link owner. Raw IP addresses and raw User-Agent strings are never written to the database.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 3. Telemetry Mechanics */}
      <section id="telemetry" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          3. Click Telemetry Pipeline
        </h2>
        <div className="mt-3 space-y-2.5">
          <p>
            <strong>Ephemeral IP Hashing:</strong> The visitor IP address is hashed in memory using SHA-256 combined with a daily random salt (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">ipHash</code>). The salt rotates every midnight UTC and previous salts are discarded. Once rotated, past hashes cannot be linked to future visits.
          </p>
          <p>
            <strong>Geographic Resolution:</strong> We resolve country and city codes locally in memory using the MaxMind GeoLite2 database via <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">geoip-lite</code>. No external API calls are made with visitor IP addresses.
          </p>
          <p>
            <strong>User-Agent Classification:</strong> Request headers are parsed into structured primitives (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">deviceType</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">browser</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">os</code>). The raw User-Agent string is discarded immediately.
          </p>
          <p>
            <strong>Referrer Sanitization:</strong> Referring URLs are stripped to hostnames only (e.g. <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">twitter.com</code>). Query strings, tracking parameters, and subpaths are permanently discarded.
          </p>
        </div>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 4. Retention & Lifecycle */}
      <section id="retention" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          4. Data Retention and Lifecycle
        </h2>
        <p className="mt-3">
          Detailed raw click records are retained for a rolling <strong>90-day window</strong>.
        </p>
        <p className="mt-2">
          A daily rollup worker aggregates click totals, unique visitors, and dimensional breakdowns into permanent daily summaries (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">daily_url_stats</code>). Once rolled up, the raw click events are permanently deleted from the database.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 5. User Rights */}
      <section id="user-rights" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          5. User Rights and Data Control
        </h2>
        <ul className="mt-3 list-disc pl-5 space-y-1.5">
          <li><strong>Data Export:</strong> Registered users can export their complete account history, links, and analytics data in JSON format on demand from the Settings page.</li>
          <li><strong>Account Deletion:</strong> Registered users can permanently delete their account at any time. Account deletion executes a cascading purge removing all user records, shortened links, and associated click records from PostgreSQL.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 6. Subprocessors */}
      <section id="subprocessors" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          6. Subprocessors and Infrastructure
        </h2>
        <p className="mt-3">
          ShortLynk relies on infrastructure providers to host and deliver the service:
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>Vercel:</strong> Static frontend hosting and edge routing.</li>
          <li><strong>Render:</strong> API application server and redirect engine hosting.</li>
          <li><strong>Neon:</strong> Managed serverless PostgreSQL database storage.</li>
        </ul>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 7. Modifications */}
      <section id="modifications" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          7. Policy Modifications
        </h2>
        <p className="mt-3">
          We may update this Privacy Policy from time to time to reflect operational or architectural adjustments. Any modifications will be reflected with an updated &ldquo;Last updated&rdquo; timestamp at the top of this page.
        </p>
      </section>

      <hr className="border-slate-200/80 dark:border-slate-800/80" />

      {/* 8. Contact */}
      <section id="contact" className="scroll-mt-28">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          8. Contact Information
        </h2>
        <p className="mt-3">
          For privacy inquiries, data requests, or security concerns, reach out to:{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </section>
    </LegalPageLayout>
  );
}
