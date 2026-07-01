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
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <h1 className="text-2xl font-bold">
          ClickU
        </h1>

        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}