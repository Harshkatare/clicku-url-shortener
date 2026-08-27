import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { getToken } from "../features/auth/auth.storage";
import { LandingLayout } from "../layouts/LandingLayout";

export function HomePage() {
  const token = getToken();
  const [copied, setCopied] = useState(false);
  const [demoClicks, setDemoClicks] = useState(1284);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleDemoCopy() {
    navigator.clipboard.writeText("https://shortlynk.in/a8X9q2");
    setCopied(true);
    setDemoClicks((prev) => prev + 1);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-blue-50/60 via-white to-gray-50/40 px-6 pt-20 pb-24 text-center">
        {/* Soft Radial Ambient Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
          <div className="h-[380px] w-[720px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Top Pill Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Shortlynk v0.4.3 • Next-Gen URL Shortener</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl sm:leading-[1.12]">
            Shorten Links.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Track Clicks.
            </span>
            <br />
            Stay in Control.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Shortlynk is a modern, high-performance URL shortener built with real-time atomic telemetry,
            collision-resistant short codes, and instant clipboard sharing.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/register"
              className="group flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-110 active:scale-[0.99]"
            >
              Get Started for Free
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>

            <Link
              to="/login"
              className="flex h-12 items-center rounded-xl border border-gray-300 bg-white/90 px-8 font-medium text-gray-700 shadow-xs backdrop-blur transition-all hover:border-gray-400 hover:bg-white active:scale-[0.99]"
            >
              Login to Dashboard
            </Link>
          </div>

          {/* Interactive Live Link Card */}
          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-gray-200/90 bg-white/95 p-5 shadow-xl shadow-gray-200/60 backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5 overflow-hidden text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-500/10">
                  <img src="/logo.svg" alt="Shortlynk" className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-400">
                    https://example.com/resources/articles/deep-dive-into-modern-web-architecture-2026
                  </p>
                  <p className="font-semibold text-blue-600 sm:text-base">
                    shortlynk.in/<span className="font-bold text-gray-900">a8X9q2</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {demoClicks.toLocaleString()} clicks
                </span>

                <button
                  onClick={handleDemoCopy}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:scale-95"
                >
                  {copied ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-b border-gray-200/70 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">56.8B+</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Possible Unique Codes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-blue-600 sm:text-4xl">&lt; 15ms</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Atomic Redirect Latency</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">100%</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Atomic SQL Telemetry</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-indigo-600 sm:text-4xl">Zero</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Interstitials or Ads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Engineered for speed, built for reliability
            </h2>
            <p className="mt-3 text-sm text-gray-500 sm:text-base">
              Everything you need to create, share, and track shortened URLs with complete confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl ring-1 ring-blue-500/10">
                ⚡
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instant Short Links</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Generate 6-character collision-resistant short codes in milliseconds with 1-click clipboard sharing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl ring-1 ring-indigo-500/10">
                📊
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Real-Time Click Tracking</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Atomic SQL telemetry tracks every visit the instant a redirect occurs with zero race conditions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-7 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl ring-1 ring-purple-500/10">
                🛡️
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Secure Link Management</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Update destinations, delete expired links, and keep your links organized with query-level ownership enforcement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-center text-white shadow-xl shadow-blue-500/20 sm:p-14">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Start shortening links in seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-100 sm:text-lg">
            Create an account, generate short links, and track telemetry in real time.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="flex h-12 items-center rounded-xl bg-white px-8 font-semibold text-blue-600 shadow-md transition hover:bg-blue-50 hover:shadow-lg active:scale-95"
            >
              Get Started for Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-10 text-center">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Shortlynk" className="h-6 w-6" />
            <span className="text-sm font-semibold text-gray-900">Shortlynk</span>
          </div>

          <p className="text-xs text-gray-400">
            © 2026 Shortlynk. Built for performance and reliability. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <Link to="/login" className="hover:text-gray-900">Login</Link>
            <Link to="/register" className="hover:text-gray-900">Sign Up</Link>
            <a
              href="https://github.com/Harshkatare/clicku-url"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </LandingLayout>
  );
}