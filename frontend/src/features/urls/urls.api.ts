import { api } from "../../api/client";

import type {
    CreateUrlInput,
    CreateUrlResponse,
    UpdateUrlInput,
    UpdateUrlResponse,
    GetUrlsResponse,
    ClaimUrlInput,
    ClaimUrlResponse,
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

export async function updateUrl(
    id: string,
    data: UpdateUrlInput
) {
    const response = await api.patch<UpdateUrlResponse>(
        `/urls/${id}`,
        data
    );

    return response.data;
}

export async function claimUrl(
    data: ClaimUrlInput
) {
    const response = await api.post<ClaimUrlResponse>(
        "/urls/claim",
        data
    );

    return response.data;
}