import { api } from "../../api/client";
import type {
    CreateUrlInput,
} from "./urls.types";

export async function createUrl(
    data: CreateUrlInput
) {
    const response = await api.post(
        "/urls",
        data
    );

    return response.data;
}

export async function getUrls() {
    const response = await api.get(
        "/urls"
    );

    return response.data;
}