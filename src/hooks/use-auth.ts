"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRoutes } from "@/config/navigation";
import {
  getMe,
  login,
  logout,
  register,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api/auth";
import { authQueryKeys } from "@/lib/api/query-keys";
import type { User } from "@/types/auth";

type UseAuthOptions = {
  fetchUser?: boolean;
};

export function useAuth(options: UseAuthOptions = {}) {
  const { fetchUser = true } = options;
  const queryClient = useQueryClient();
  const router = useRouter();

  const userQuery = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    retry: false,
    enabled: fetchUser,
  });

  const setUser = (user: User | undefined) => {
    queryClient.setQueryData(authQueryKeys.me, user);
  };

  const clearUser = () => {
    queryClient.removeQueries({ queryKey: authQueryKeys.me });
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearUser();
      router.replace(authRoutes.login);
    },
  });

  return {
    user: userQuery.data,
    isLoading: fetchUser ? userQuery.isLoading : false,
    isAuthenticated: Boolean(userQuery.data),
    isError: userQuery.isError,
    refetchUser: userQuery.refetch,
    setUser,
    clearUser,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    resetLogin: loginMutation.reset,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    resetRegister: registerMutation.reset,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

export type { LoginInput, RegisterInput };
