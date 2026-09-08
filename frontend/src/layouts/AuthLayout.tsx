import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/common/Logo";
import { useTheme } from "../hooks/useTheme";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  const { dark, toggle } = useTheme();

  return (
    <div className="hero-grid relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-slate-50 px-4 py-8 sm:py-12 dark:bg-slate-950 transition-colors duration-200">
      {/* Atmospheric Ambient Glow Blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/15" />

      {/* Top Utility Bar (in natural document flow, perfectly framed above the card) */}
      <div className="relative mb-4 flex w-full max-w-md items-center justify-between sm:mb-6 z-10">
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

      {/* Main Glassmorphic Auth Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl sm:p-10 dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors duration-200">
        <div className="mb-7 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-2.5 group">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Logo size={46} variant="badge" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Short<span className="gradient-primary">lynk</span>
            </span>
          </Link>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}