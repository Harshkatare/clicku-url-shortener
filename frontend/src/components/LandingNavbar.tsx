import { Link } from "react-router-dom";

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <img src="/logo.svg" alt="Shortlynk" className="h-7 w-7 shrink-0 select-none sm:h-8 sm:w-8" />
          <span className="select-none text-xl font-bold tracking-tight text-blue-600 sm:text-2xl">
            Shortlynk
          </span>
          <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20 sm:inline-block">
            v0.4.3
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-gray-300/90 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm"
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
    </header>
  );
}