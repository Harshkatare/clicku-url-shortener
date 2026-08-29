import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { getToken, removeToken } from "../features/auth/auth.storage";

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function ProtectedRoute() {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    if (token) {
      removeToken();
    }
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}