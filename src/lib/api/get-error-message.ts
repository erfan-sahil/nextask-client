import axios from "axios";
import type { ApiErrorResponse } from "@/types/api";

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
