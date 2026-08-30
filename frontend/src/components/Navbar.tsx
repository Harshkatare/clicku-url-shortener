import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { removeToken } from "../features/auth/auth.storage";
import { getMe } from "../features/auth/auth.api";
import { useTheme } from "../hooks/useTheme";

export function Navbar() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
  });

  function handleLogout() {
    removeToken();
    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Shortlynk" className="h-8 w-8 select-none" />
          <h1 className="select-none text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
            Shortlynk
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:h-10 sm:w-10 cursor-pointer"
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

          {meData?.data?.email && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                {meData.data.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{meData.data.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 sm:px-4 sm:py-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}