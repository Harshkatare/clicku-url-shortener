import axios from "axios";
import { getToken } from "../features/auth/auth.storage";

export const api = axios.create({
    baseURL:
        "https://clicku-url-shortener.onrender.com/api/v1",
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});