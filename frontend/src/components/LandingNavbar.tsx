import { Link } from "react-router-dom";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Shortlynk" className="h-8 w-8 select-none" />
          <span className="select-none text-2xl font-bold tracking-tight text-blue-600">
            Shortlynk
          </span>
          <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 sm:inline-block">
            v0.4.3
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-gray-300/90 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs transition hover:bg-gray-50"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition hover:brightness-110 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}