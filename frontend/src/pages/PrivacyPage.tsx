import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/common/Logo";
import { Footer } from "../components/landing/Footer";
import { useTheme } from "../hooks/useTheme";
import { getToken, isTokenExpired } from "../features/auth/auth.storage";

export function PrivacyPage() {
  const { dark, toggle } = useTheme();
  const token = getToken();
  const isAuthenticated = Boolean(token && !isTokenExpired(token));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div>
        {/* Top Glassmorphic Navbar */}
        <header className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-200">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <Logo size={32} />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                ShortLynk
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:h-10 sm:w-10 cursor-pointer"
                title="Toggle theme"
              >
                {dark ? (
                  <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm cursor-pointer"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300/90 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:px-4 sm:py-2 sm:text-sm cursor-pointer"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-3xl px-6 py-12 prose dark:prose-invert">
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: October 2026
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                1. Overview
              </h2>
              <p className="mt-3">
                ShortLynk provides link shortening and click telemetry services. We design and operate the platform with data minimization as a core constraint:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-slate-900 dark:text-white">Zero data sales:</strong> We do not sell, rent, or monetize your data or your visitors' data to third-party brokers, advertisers, or aggregators.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">No third-party tracking cookies:</strong> We do not set cross-site tracking cookies, behavioral tracking scripts, or ad-network beacons.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">No cross-site profiling:</strong> Visitor clicks are not linked across distinct websites or used to build behavioral dossiers.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                2. Information Collected from Account Holders
              </h2>
              <p className="mt-3">
                When you create an account or interact with our dashboard, we collect:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-slate-900 dark:text-white">Account credentials:</strong> Your name, email address, and password. Passwords are never stored in plain text; they are hashed using the scrypt key derivation function with unique cryptographic salts.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Authentication tokens:</strong> JSON Web Tokens (JWT) stored locally in browser storage to authenticate API sessions.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Link metadata:</strong> Destination URLs, generated short codes, custom aliases, creation timestamps, link status (active, expiring, or archived), and pinned state.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                3. Click Telemetry & Redirect Processing
              </h2>
              <p className="mt-3">
                When an end user clicks a shortened link (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">/:code</code>), our redirect engine captures aggregate operational metrics:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-slate-900 dark:text-white">Ephemeral IP hashing:</strong> Visitor IP addresses are hashed in-memory using SHA-256 combined with a daily salt that rotates automatically at 00:00 UTC. This generates an ephemeral identifier (<code className="text-xs font-mono">ipHash</code>) to count daily unique clicks while mathematically preventing cross-day user tracking. Raw IP addresses are immediately discarded and never stored in the database.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">GeoIP resolution:</strong> Coarse geographic location (country code and city) is derived in-memory via <code className="text-xs font-mono">geoip-lite</code> before the IP address is discarded.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Device & browser classification:</strong> The User-Agent header is parsed in-memory to classify device type (desktop, mobile, tablet), browser engine, operating system, and automated bot status (<code className="text-xs font-mono">isbot</code>). The raw User-Agent string is discarded and never stored.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Referrer attribution:</strong> HTTP referrers are parsed to retain only the referring domain (e.g., <code className="text-xs font-mono">twitter.com</code> or <code className="text-xs font-mono">Direct</code>). Query strings and sensitive URL parameters are stripped prior to storage.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                4. Data Retention & 90-Day Rollup
              </h2>
              <p className="mt-3">
                Raw click event records are retained in the database for 90 days to power granular time-series analytics and peak hour breakdowns.
              </p>
              <p className="mt-2">
                An automated rollup worker runs daily to aggregate click statistics older than 90 days into permanent historical summary records (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">daily_url_stats</code>). Once rolled up, the corresponding raw click records are permanently purged from the database.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                5. Account Control & User Rights
              </h2>
              <p className="mt-3">
                You maintain direct control over your stored data:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>
                  <strong className="text-slate-900 dark:text-white">Data export:</strong> You can export a full machine-readable JSON archive containing your account profile, all created links, and aggregated click statistics from the Settings page at any time.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Account deletion:</strong> You can delete your account from the Settings page. This executes an immediate database cascade that permanently removes your user record, all associated URLs, and all related click telemetry records.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                6. Contact
              </h2>
              <p className="mt-3">
                If you have questions about this Privacy Policy or our telemetry handling, contact us at:{" "}
                <a
                  href="mailto:support@shortlynk.in"
                  className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  support@shortlynk.in
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
