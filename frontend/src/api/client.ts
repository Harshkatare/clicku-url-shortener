import axios from "axios";

export const api = axios.create({
    baseURL:
        "https://clicku-url-shortener.onrender.com/api/v1",
});