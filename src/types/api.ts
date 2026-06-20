export type ApiSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errorCode?: string;
  errors?: Array<{ field?: string; message: string }>;
  requestId?: string;
};
