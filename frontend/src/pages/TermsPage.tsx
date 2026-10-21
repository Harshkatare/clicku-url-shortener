import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/common/Logo";
import { Footer } from "../components/landing/Footer";
import { useTheme } from "../hooks/useTheme";
import { getToken, isTokenExpired } from "../features/auth/auth.storage";

export function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated: October 2026
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing or using ShortLynk ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                2. Acceptable Use Policy
              </h2>
              <p className="mt-3">
                You agree to use ShortLynk solely for lawful purposes. You may not use the Service to create short links that redirect to, distribute, or promote:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Malware, viruses, ransomware, trojans, or malicious payloads.</li>
                <li>Phishing sites, credential theft pages, or deceptive landing pages.</li>
                <li>Unsolicited bulk email (spam) campaigns or abusive messaging.</li>
                <li>Fraudulent financial schemes or content violating applicable laws.</li>
              </ul>
              <p className="mt-3">
                Any link identified as violating this Acceptable Use Policy is subject to immediate deactivation, and the associated user account may be terminated without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                3. Reserved Slugs & Namespace Protection
              </h2>
              <p className="mt-3">
                Certain short codes and URL paths are reserved for platform infrastructure, routing, API endpoints, authentication, and core application interfaces.
              </p>
              <p className="mt-2">
                System-reserved slugs include, but are not limited to: <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">admin</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">api</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">login</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">register</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">dashboard</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">settings</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">analytics</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">pricing</code>, <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">terms</code>, and <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono text-slate-800 dark:bg-slate-800 dark:text-slate-200">privacy</code>.
              </p>
              <p className="mt-2">
                We retain the right to reclaim, reassign, or reject any custom alias that infringes on registered trademarks, impersonates official entities, or conflicts with platform operations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                4. Rate Limiting & Platform Integrity
              </h2>
              <p className="mt-3">
                To safeguard service stability and protect shared infrastructure, automated rate limits are enforced across API endpoints, link generation routes, and redirect endpoints.
              </p>
              <p className="mt-2">
                Circumventing rate limit mechanisms, executing denial-of-service attempts, or performing unauthorized security vulnerability scans against the Service is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                5. Service Availability & Modifications
              </h2>
              <p className="mt-3">
                ShortLynk is provided on an "as is" and "as available" basis without uptime service level agreements (SLAs) or guarantees of uninterrupted operation.
              </p>
              <p className="mt-2">
                We reserve the right to modify, update, or discontinue features of the platform at any time for maintenance, security updates, or operational enhancements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                6. Limitation of Liability
              </h2>
              <p className="mt-3">
                ShortLynk functions solely as a technical routing service. We do not control or endorse the content of third-party destination URLs created by users.
              </p>
              <p className="mt-2">
                To the maximum extent permitted by law, ShortLynk and its operators are not liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                7. Account Termination
              </h2>
              <p className="mt-3">
                You may terminate your account at any time via the account deletion feature in the Settings page. Upon confirmation, your account and associated data will be permanently removed.
              </p>
              <p className="mt-2">
                We reserve the right to suspend or terminate accounts that breach these Terms of Service or engage in abusive activities that compromise the integrity of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                8. Contact
              </h2>
              <p className="mt-3">
                If you have questions or concerns regarding these Terms of Service, please reach out to us at:{" "}
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
