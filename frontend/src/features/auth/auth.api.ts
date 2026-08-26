import { api } from "../../api/client";
import type {
    LoginInput,
    RegisterInput,
    AuthResponse,
} from "./auth.types";

export async function login(
    data: LoginInput
) {
    const response = await api.post<AuthResponse>(
        "/auth/login",
        data
    );

    return response.data;
}

export async function register(
    data: RegisterInput
) {
    const response = await api.post<AuthResponse>(
        "/auth/signup",
        data
    );

    return response.data;
}