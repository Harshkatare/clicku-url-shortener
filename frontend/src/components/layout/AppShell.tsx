import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { removeToken } from "../../features/auth/auth.storage";
import { getMe } from "../../features/auth/auth.api";
import { useTheme } from "../../hooks/useTheme";
import { Logo } from "../common/Logo";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });

  function handleLogout() {
    removeToken();
    navigate("/login", { replace: true });
  }

  // 1. Hardened Initials Parsing: Trim, regex whitespace split, truthy filter
  const rawName = meData?.data?.name?.trim() || "";
  const initials = rawName
    ? rawName
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Analytics", path: "/analytics" },
    { label: "Settings", path: "/settings" },
  ];

  // 4. Future-proof active route detection
  const isLinkActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-gray-200/60 dark:border-slate-800/80 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Section: Mobile Toggle + Logo + Nav Tabs */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 3. WCAG Accessible Focus Rings */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="transition-transform duration-200 group-hover:scale-105">
              <Logo size={32} variant="standard" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Short<span className="gradient-primary">lynk</span>
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <div className="ml-8 hidden items-center gap-6 md:flex">
            {navLinks.map((tab) => {
              const active = isLinkActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`text-sm font-semibold transition-colors duration-150 rounded-lg px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Notifications + Theme + Avatar + Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Notification Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 transition dark:text-slate-400 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="animate-pulse-soft absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* 2. Invisible backdrop overlay for outside click dismissal */}
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-72 z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 transition-all">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Notifications
                    </p>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <div className="rounded-xl bg-blue-50/80 p-3 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30">
                    <p className="font-semibold text-xs text-blue-800 dark:text-blue-300">🎉 Welcome to Shortlynk!</p>
                    <p className="mt-1 text-xs text-blue-600/90 dark:text-blue-400/90 leading-relaxed">
                      Create, customize, and analyze your shortened URLs seamlessly.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-100 transition dark:border-slate-800/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? (
              <svg className="h-4.5 w-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4.5 w-4.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Avatar Initials Pill */}
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white shadow-xs select-none transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            title={rawName || "Profile Settings"}
            onClick={() => navigate("/settings")}
            aria-label="User settings"
          >
            {initials}
          </button>

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex rounded-xl border border-slate-300/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-700/80 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative border-b border-slate-200/80 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 transition-all">
            <div className="space-y-2">
              {navLinks.map((tab) => {
                const active = isLinkActive(tab.path);
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
