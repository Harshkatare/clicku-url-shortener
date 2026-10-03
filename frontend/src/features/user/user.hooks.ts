import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, changePassword, deleteAccount } from "./user.api";
import { removeToken } from "../auth/auth.storage";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
} from "./user.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (res) => {
      queryClient.setQueryData(["auth", "me"], res);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => changePassword(data),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAccountInput) => deleteAccount(data),
    onSuccess: () => {
      removeToken();
      queryClient.clear();
    },
  });
}
