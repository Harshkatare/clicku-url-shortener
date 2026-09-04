import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";
import { useTheme } from "../../hooks/useTheme";
import { copyToClipboard } from "../../utils/copy";
import { api } from "../../api/client";

interface DemoResponse {
  success: boolean;
  data: {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
  };
}

export function HeroSection() {
  const { dark, toggle } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleShorten() {
    const trimmed = url.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await api.post<DemoResponse>("/urls/demo", {
        originalUrl: trimmed,
      });

      if (res.data.success && res.data.data) {
        const fullShortUrl = res.data.data.shortUrl.startsWith("http")
          ? res.data.data.shortUrl
          : `${window.location.origin}/${res.data.data.shortCode}`;
        setResult(fullShortUrl);
      }
    } catch (err: unknown) {
      setResult(null);
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg =
        errObj.response?.data?.message ??
        "Failed to shorten demo URL. Please check the URL format and try again.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    const ok = await copyToClipboard(result);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleFocusInput() {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="relative">
      {/* Glassmorphic Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Logo size={32} />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              ShortLynk
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              FAQ
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:h-10 sm:w-10 cursor-pointer"
              title="Toggle theme"
            >
              {dark ? (
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <Link
              to="/login"
              className="rounded-xl border border-gray-300/90 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition hover:brightness-110 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Body */}
      <section className="hero-grid relative min-h-screen overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-pink-400/8 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center px-6 py-10 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-blue-500" />
            Fully interactive demo — try it live
          </div>

          {/* Heading */}
          <h1 className="animate-slide-up text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Shorten. <span className="gradient-text-primary">Analyze.</span>
            <br />
            <span className="gradient-text-accent">Optimize.</span>
          </h1>

          {/* Tagline */}
          <p
            className="typing-cursor animate-slide-up mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300"
            style={{ animationDelay: "0.1s" }}
          >
            Track every click, generate QR codes, and own your links.
          </p>

          {/* Interactive Demo Shortener Input */}
          <div
            className="animate-slide-up mt-10 flex w-full flex-col items-center gap-4"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex w-full max-w-md items-center rounded-xl border border-gray-300 bg-white p-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500 dark:border-slate-600 dark:bg-slate-800">
              <input
                ref={inputRef}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleShorten()}
                type="url"
                placeholder="Paste your long URL here..."
                disabled={loading}
                className="h-11 flex-1 rounded-lg border-0 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-gray-400 dark:text-white"
              />
              <button
                onClick={handleShorten}
                disabled={loading}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Shortening..." : "Shorten"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl dark:shadow-blue-900/30"
              >
                Get Started Free
              </Link>
              <button
                onClick={handleFocusInput}
                className="rounded-xl border border-gray-300 px-8 py-3.5 text-lg font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Try Demo →
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Free forever · No credit card · 14-day analytics · No signup required to try the demo
            </p>
          </div>

          {/* Error Message Card */}
          {errorMessage && (
            <div className="mt-6 animate-scale-in rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Success Copy Result Card */}
          {result && (
            <div className="mt-6 animate-scale-in">
              <div className="flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-6 py-4 dark:border-green-800 dark:bg-green-900/20">
                <span className="text-2xl">🎉</span>
                <div className="text-left">
                  <p className="font-mono text-sm font-medium text-green-800 dark:text-green-300">
                    {result}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Added to your dashboard — sign in to claim and track it.
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 cursor-pointer"
                >
                  {copied ? "✓ Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
