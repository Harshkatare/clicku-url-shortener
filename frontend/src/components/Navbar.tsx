import { useNavigate } from "react-router-dom";

import { removeToken } from "../features/auth/auth.storage";

export function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    removeToken();

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="Shortlynk" className="h-8 w-8 select-none" />
          <h1 className="select-none text-2xl font-bold tracking-tight text-blue-600">
            Shortlynk
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}