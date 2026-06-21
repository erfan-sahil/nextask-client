import type { ApiSuccessResponse } from "@/types/api";
import type { AuthPayload, RegisterPayload, User } from "@/types/auth";
import { apiClient } from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1";

type LoginInput = {
  email: string;
  password: string;
};

type VerifyEmailInput = {
  otp: string;
};

export const login = async (input: LoginInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthPayload>>(
    "/auth/login",
    input
  );

  return data.data;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export const register = async (input: RegisterInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<RegisterPayload>>(
    "/auth/register",
    input
  );

  return data.data;
};

export const verifyEmail = async (input: VerifyEmailInput) => {
  const { data } = await apiClient.post<ApiSuccessResponse<{ user: User }>>(
    "/auth/verify-email",
    input
  );

  return data.data;
};

export const resendVerification = async () => {
  const { data } = await apiClient.post<ApiSuccessResponse<{ user: User }>>(
    "/auth/resend-verification"
  );

  return data.data;
};

export const getMe = async () => {
  const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>(
    "/auth/me"
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
