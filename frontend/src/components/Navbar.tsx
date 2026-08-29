import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { removeToken } from "../features/auth/auth.storage";
import { getMe } from "../features/auth/auth.api";

export function Navbar() {
  const navigate = useNavigate();
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
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Shortlynk" className="h-8 w-8 select-none" />
          <h1 className="select-none text-2xl font-bold tracking-tight text-blue-600">
            Shortlynk
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {meData?.data?.email && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {meData.data.name || "User"}
              </p>
              <p className="text-xs text-gray-500">{meData.data.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition hover:bg-red-700 sm:px-4 sm:py-2"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}