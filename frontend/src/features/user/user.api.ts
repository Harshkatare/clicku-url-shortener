import { api } from "../../api/client";
import type {
  UpdateProfileInput,
  UpdateProfileResponse,
  ChangePasswordInput,
  ChangePasswordResponse,
  DeleteAccountInput,
  DeleteAccountResponse,
} from "./user.types";

export async function updateProfile(
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> {
  const response = await api.patch<UpdateProfileResponse>("/users/me", data);
  return response.data;
}

export async function changePassword(
  data: ChangePasswordInput
): Promise<ChangePasswordResponse> {
  const response = await api.post<ChangePasswordResponse>(
    "/users/me/change-password",
    data
  );
  return response.data;
}

export async function deleteAccount(
  data: DeleteAccountInput
): Promise<DeleteAccountResponse> {
  const response = await api.delete<DeleteAccountResponse>("/users/me", {
    data,
  });
  return response.data;
}

export async function exportUserData(): Promise<void> {
  const response = await api.get("/users/me/export", {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "shortlynk-data-export.json";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
