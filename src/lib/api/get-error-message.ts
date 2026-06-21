import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";

const stripBodyPrefix = (field: string) => field.replace(/^body\./, "");

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }

    return error.response.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const getApiFieldErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  for (const item of error.response?.data?.errors ?? []) {
    if (!item.field) {
      continue;
    }

    const field = stripBodyPrefix(item.field);

    if (!fieldErrors[field]) {
      fieldErrors[field] = item.message;
    }
  }

  return fieldErrors;
};

export const getConflictFieldErrors = (
  error: unknown,
): Record<string, string> => {
  const message = getErrorMessage(error);

  if (message.includes("Email already")) {
    return { email: message };
  }

  if (message.includes("Username already")) {
    return { username: message };
  }

  return {};
};

export const getAuthFormErrors = (error: unknown): Record<string, string> => {
  return {
    ...getApiFieldErrors(error),
    ...getConflictFieldErrors(error),
  };
};
