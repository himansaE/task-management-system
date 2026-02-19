import { apiClient } from "./client";
import { ApiEnvelope, AuthUser } from "./types";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

type AuthUserResponse = {
  user: AuthUser;
};

export async function register(payload: RegisterPayload) {
  const response = await apiClient.post<ApiEnvelope<AuthUserResponse>>(
    "/auth/register",
    payload,
  );
  return response.data.data.user;
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<ApiEnvelope<AuthUserResponse>>(
    "/auth/login",
    payload,
  );
  return response.data.data.user;
}

export async function refreshSession() {
  const response =
    await apiClient.post<ApiEnvelope<AuthUserResponse>>("/auth/refresh");
  return response.data.data.user;
}

export async function getCurrentSessionUser() {
  const response =
    await apiClient.get<ApiEnvelope<AuthUserResponse>>("/auth/me");
  return response.data.data.user;
}

export async function logoutSession() {
  await apiClient.post<ApiEnvelope<{ ok: boolean }>>("/auth/logout");
}

export async function revokeSessions() {
  await apiClient.post<ApiEnvelope<{ ok: boolean }>>("/auth/revoke");
}
