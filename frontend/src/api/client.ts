import axios from "axios";
import { getToken } from "../features/auth/auth.storage";
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