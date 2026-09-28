import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { getToken, removeToken, isTokenExpired } from "../features/auth/auth.storage";

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