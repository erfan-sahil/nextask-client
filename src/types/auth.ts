export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string | null;
  authProvider?: "local" | "google";
  isEmailVerified: boolean;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};

export type RegisterPayload = {
  email: string;
  verificationEmailSent: boolean;
};
