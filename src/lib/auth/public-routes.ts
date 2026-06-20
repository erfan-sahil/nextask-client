import { authRoutes } from "@/config/navigation";

export const PUBLIC_ROUTES = [
  "/",
  authRoutes.login,
  authRoutes.register,
  authRoutes.verifyEmail,
] as const;
