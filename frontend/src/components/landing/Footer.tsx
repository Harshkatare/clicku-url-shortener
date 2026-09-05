import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";

export function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-slate-200/80 bg-white/60 py-14 backdrop-blur-xs transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission (2 columns on desktop) */}
          <div className="sm:col-span-2 lg:col-span-2">
            <button
              onClick={handleScrollTop}
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-85 dark:text-white cursor-pointer"
              aria-label="ShortLynk Home"
            >
              <Logo size={28} />
              <span>ShortLynk</span>
            </button>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Shorten, analyze, optimize. The high-performance link management platform engineered for speed, telemetry, and conversion.
            </p>

            {/* Live Operational Status Indicator */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              All systems operational
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
              Product
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="#features"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  to="/login"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <a
                  href="#demo"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Try Demo
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
              Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="#privacy"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-Bar */}
        <div className="mt-12 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          &copy; {new Date().getFullYear()} ShortLynk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
