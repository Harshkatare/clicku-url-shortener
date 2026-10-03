import axios from "axios";
import { getToken, removeToken } from "../features/auth/auth.storage";
import { env } from "../config/env";

export const api = axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const method = error.config?.method?.toLowerCase() ?? "";
    const isCredentialCheck = Boolean(
      url.includes("/auth/login") ||
      url.includes("/users/me/change-password") ||
      (url.includes("/users/me") && method === "delete")
    );

    if (error.response?.status === 401 && !isCredentialCheck) {
      removeToken();
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

