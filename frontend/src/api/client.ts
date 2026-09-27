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
    const isLoginRequest = Boolean(
      error.config?.url?.includes("/auth/login")
    );

    if (error.response?.status === 401 && !isLoginRequest) {
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

