import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/auth/token-storage";
import type { ApiSuccessResponse } from "@/types/api";
import type { AuthPayload } from "@/types/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api/v1";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const AUTH_ENDPOINTS_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
];

let refreshPromise: Promise<void> | null = null;
let refreshFailed = false;

const shouldSkipRefresh = (url?: string) => {
  if (!url) {
    return true;
  }

  return AUTH_ENDPOINTS_WITHOUT_REFRESH.some((path) => url.includes(path));
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<ApiSuccessResponse<AuthPayload>>("/auth/refresh", {
        refreshToken: getRefreshToken() ?? undefined,
      })
      .then((response) => {
        const { accessToken, refreshToken } = response.data.data;
        setAuthTokens({ accessToken, refreshToken });
        refreshFailed = false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/** Call after a successful login so 401 refresh can be tried again. */
export const resetAuthRefreshState = () => {
  refreshFailed = false;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      !originalRequest ||
      originalRequest._retry ||
      error.response?.status !== 401 ||
      refreshFailed ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();

      const accessToken = getAccessToken();

      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      return apiClient(originalRequest);
    } catch {
      refreshFailed = true;
      clearAuthTokens();
      return Promise.reject(error);
    }
  },
);
