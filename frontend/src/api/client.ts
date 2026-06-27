import axios from "axios";

export const api = axios.create({
    baseURL:
        "https://clicku-url-shortener.onrender.com/api/v1",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});