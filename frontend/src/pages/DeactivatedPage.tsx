import { Link, useSearchParams } from "react-router-dom";
import { Logo } from "../components/common/Logo";
import { useTheme } from "../hooks/useTheme";

export function DeactivatedPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { dark, toggle } = useTheme();

  return (
    <div className="hero-grid relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-slate-50 px-4 py-8 sm:py-12 dark:bg-slate-950 transition-colors duration-200">
      {/* Subtle Atmospheric Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-rose-500/5 blur-3xl dark:bg-rose-500/10" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />

      {/* Top Utility Bar */}
      <div className="relative mb-6 flex w-full max-w-md items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-xs backdrop-blur-md transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
        >
          <span>←</span>
          <span>Back to Shortlynk</span>
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 shadow-xs backdrop-blur-md transition hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer touch-manipulation"
        >
          {dark ? (
            <svg className="pointer-events-none h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="pointer-events-none h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Main Deactivated Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-9 dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors duration-200">
        <div className="text-center">
          {/* Brand Mark */}
          <Link to="/" className="inline-flex flex-col items-center gap-2 group mb-5">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Logo size={42} variant="badge" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Short<span className="gradient-primary">lynk</span>
            </span>
          </Link>

          {/* Deactivated Icon & Status Pill */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Link Inactive / Archived
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            This link has been deactivated
          </h1>

          {/* Target Short URL Display */}
          {code && (
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 px-3.5 py-1.5 font-mono text-xs text-slate-700 shadow-inner dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
              <span className="text-slate-400">shortlynk.in/</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{code}</span>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The creator of this short link has archived or expired it. It is no longer actively forwarding visitors to its destination.
          </p>

          {/* Reassurance Callout Box */}
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-left text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="flex items-start gap-2">
              <span className="text-sm leading-none mt-0.5">💡</span>
              <span className="leading-relaxed">
                <strong>Expecting this link to work?</strong> Reach out directly to the person or company who shared it with you to request an updated or active URL.
              </span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            >
              <span>Create Your Own Short Links</span>
              <span>→</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In to Shortlynk Dashboard
            </Link>
          </div>
        </div>

        {/* PLG Branding Footer */}
        <div className="mt-8 border-t border-slate-100 pt-4 text-center dark:border-slate-800/70">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Powered by <span className="font-semibold text-slate-600 dark:text-slate-400">Shortlynk</span> • Clean, modern link infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
