import {
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/auth/token-storage";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthPayload, RegisterPayload, User } from "@/types/auth";
import { API_BASE_URL, apiClient } from "./client";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type UpdateProfileInput = Pick<
  RegisterInput,
  "firstName" | "lastName" | "username"
>;

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type DeleteAccountInput = {
  currentPassword: string;
};

type VerifyEmailInput = {
  email: string;
  otp: string;
};

type ResendVerificationInput = {
  email: string;
};

const persistAuthPayload = (payload: AuthPayload) => {
  setAuthTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  return payload;
};

export const login = async (input: LoginInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthPayload>>(
    "/auth/login",
    input,
  );

  return persistAuthPayload(data.data);
};

export const register = async (input: RegisterInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<RegisterPayload>>(
    "/auth/register",
    input,
  );

  return data.data;
};

export const refreshSession = async () => {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthPayload>>(
    "/auth/refresh",
  );

  return persistAuthPayload(data.data);
};

export const logout = async () => {
  try {
    await apiClient.post<ApiSuccessResponse<null>>("/auth/logout", {
      refreshToken: getRefreshToken() ?? undefined,
    });
  } finally {
    clearAuthTokens();
  }
};

export const updateProfile = async (input: UpdateProfileInput) => {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ user: User }>>(
    "/auth/profile",
    input,
  );

  return data.data.user;
};

export const changePassword = async (input: ChangePasswordInput) => {
  await apiClient.patch<ApiSuccessResponse<null>>("/auth/password", input);
  clearAuthTokens();
};

export const deleteAccount = async (input: DeleteAccountInput) => {
  await apiClient.delete<ApiSuccessResponse<null>>("/auth/account", {
    data: input,
  });
  clearAuthTokens();
};

export const verifyEmail = async (input: VerifyEmailInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthPayload>>(
    "/auth/verify-email",
    input,
  );

  if (data.data.accessToken) {
    persistAuthPayload(data.data);
  }

  return data.data;
};

export const resendVerification = async (input: ResendVerificationInput) => {
  const { data } = await apiClient.post<
    ApiSuccessResponse<{ email: string }>
  >("/auth/resend-verification", input);

  return data.data;
};

export const getMe = async () => {
  const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>(
    "/auth/me",
  );

  return data.data.user;
};

export const getGoogleAuthUrl = (callbackUrl?: string) => {
  const url = new URL(`${API_BASE_URL}/auth/google`);

  if (callbackUrl?.startsWith("/")) {
    url.searchParams.set("callbackUrl", callbackUrl);
  }

  return url.toString();
};
