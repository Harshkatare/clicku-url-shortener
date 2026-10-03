import type { User } from "../auth/auth.types";
import type { Url } from "../urls/urls.types";

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: User;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface DeleteAccountInput {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export interface UserDataExport {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  urls: Omit<Url, "userId">[];
  exportedAt: string;
}
