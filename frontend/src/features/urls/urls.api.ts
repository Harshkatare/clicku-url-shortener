import { api } from "../../api/client";

import type {
    CreateUrlInput,
    CreateUrlResponse,
    GetUrlsResponse
} from "./urls.types";

export async function createUrl(
    data: CreateUrlInput
) {
    const response = 
            await api.post<CreateUrlResponse>(
        "/urls",
        data
    );

    return response.data;
}

export async function getUrls() {
    const response = await api.get<GetUrlsResponse>(
        "/urls"
    );

    return response.data;
}

export async function deleteUrl(
    id: string
) {
    const response = 
        await api.delete( `/urls/${id}`);

    return response.data;
}