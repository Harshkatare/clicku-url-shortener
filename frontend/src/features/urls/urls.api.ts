import { api } from "../../api/client";

import type {
  CreateUrlInput,
  CreateUrlResponse,
  UpdateUrlInput,
  UpdateUrlResponse,
  ReorderUrlInput,
  ReorderUrlResponse,
  GetUrlsResponse,
  DeleteUrlResponse,
  ClaimUrlInput,
  ClaimUrlResponse,
  UrlQueryFilters,
} from "./urls.types";

export async function createUrl(
  data: CreateUrlInput
): Promise<CreateUrlResponse> {
  const response = await api.post<CreateUrlResponse>("/urls", data);
  return response.data;
}

export async function getUrls(
  filters?: UrlQueryFilters
): Promise<GetUrlsResponse> {
  const response = await api.get<GetUrlsResponse>("/urls", {
    params: filters,
  });
  return response.data;
}

export async function deleteUrl(id: string): Promise<DeleteUrlResponse> {
  const response = await api.delete<DeleteUrlResponse>(`/urls/${id}`);
  return response.data;
}

export async function updateUrl(
  id: string,
  data: UpdateUrlInput
): Promise<UpdateUrlResponse> {
  const response = await api.patch<UpdateUrlResponse>(`/urls/${id}`, data);
  return response.data;
}

export async function reorderUrl(
  id: string,
  data: ReorderUrlInput
): Promise<ReorderUrlResponse> {
  const response = await api.patch<ReorderUrlResponse>(
    `/urls/${id}/reorder`,
    data
  );
  return response.data;
}

export async function claimUrl(
  data: ClaimUrlInput
): Promise<ClaimUrlResponse> {
  const response = await api.post<ClaimUrlResponse>("/urls/claim", data);
  return response.data;
}