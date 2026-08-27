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
      <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-blue-50/60 via-white to-gray-50/40 px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-20 sm:pb-24">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
          <div className="h-[380px] w-[720px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          {/* Top Badge */}
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur sm:px-4">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-blue-600 animate-pulse" />
            <span className="truncate">Shortlynk v0.4.3 &bull; Next-Gen URL Shortener</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-6xl sm:leading-[1.12]">
            Shorten Links.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Track Clicks.
            </span>
            <br />
            Stay in Control.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-gray-600 sm:mt-6 sm:text-lg sm:leading-7">
            Shortlynk is a modern, high-performance URL shortener built with real-time atomic telemetry,
            collision-resistant short codes, and instant clipboard sharing.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/register"
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-110 active:scale-[0.99] sm:h-12 sm:w-auto sm:px-8"
            >
              <span>Get Started for Free</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              to="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-300 bg-white/90 px-6 font-medium text-gray-700 shadow-xs backdrop-blur transition-all hover:border-gray-400 hover:bg-white active:scale-[0.99] sm:h-12 sm:w-auto sm:px-8"
            >
              Login to Dashboard
            </Link>
          </div>

          {/* Interactive Live Link Card */}
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gray-200/90 bg-white/95 p-4 shadow-xl shadow-gray-200/60 backdrop-blur sm:mt-14 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 overflow-hidden text-left sm:gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-500/10 sm:h-11 sm:w-11">
                  <img src="/logo.svg" alt="Shortlynk" className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-400">
                    https://example.com/resources/articles/deep-dive-into-modern-web-architecture-2026
                  </p>
                  <p className="text-sm font-semibold text-blue-600 sm:text-base">
                    shortlynk.in/<span className="font-bold text-gray-900">a8X9q2</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 sm:justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 ring-inset sm:px-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {demoClicks.toLocaleString()} clicks
                </span>

                <button
                  onClick={handleDemoCopy}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 active:scale-95 sm:px-3.5"
                >
                  {copied ? (
                    <>
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy Link</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="border-b border-gray-200/70 bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 sm:text-4xl">56.8B+</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Possible Unique Codes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-blue-600 sm:text-4xl">&lt; 15ms</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Atomic Redirect Latency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-gray-900 sm:text-4xl">100%</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Atomic SQL Telemetry</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-indigo-600 sm:text-4xl">Zero</p>
              <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">Interstitials or Ads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center sm:mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Engineered for speed, built for reliability
            </h2>
            <p className="mt-2.5 text-sm text-gray-500 sm:mt-3 sm:text-base">
              Everything you need to create, share, and track shortened URLs with complete confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 sm:gap-6">
            {/* Card 1 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md sm:p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-500/10">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instant Short Links</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Generate 6-character collision-resistant short codes in milliseconds with 1-click clipboard sharing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md sm:p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-500/10">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Real-Time Click Tracking</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Atomic SQL telemetry tracks every visit the instant a redirect occurs with zero race conditions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md sm:p-7">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 ring-1 ring-purple-500/10">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
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
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-center text-white shadow-xl shadow-blue-500/20 sm:p-14">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            Start shortening links in seconds.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100 sm:mt-4 sm:text-lg">
            Create an account, generate short links, and track telemetry in real time.
          </p>
          <div className="mt-7 flex justify-center sm:mt-8">
            <Link
              to="/register"
              className="flex h-11 items-center rounded-xl bg-white px-7 font-semibold text-blue-600 shadow-md transition hover:bg-blue-50 hover:shadow-lg active:scale-95 sm:h-12 sm:px-8"
            >
              Get Started for Free &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Shortlynk" className="h-6 w-6" />
            <span className="text-sm font-semibold text-gray-900">Shortlynk</span>
          </div>

          <p className="text-xs text-gray-400">
            &copy; 2026 Shortlynk. Built for performance and reliability. All rights reserved.
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