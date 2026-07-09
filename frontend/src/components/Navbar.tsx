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
        <h1 className="select-none text-3xl font-bold tracking-tight text-blue-600">
          ClickU
        </h1>

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