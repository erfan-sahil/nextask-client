"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authRoutes } from "@/config/navigation";
import {
  changePassword,
  deleteAccount,
  getMe,
  login,
  logout as logoutRequest,
  register,
  resendVerification,
  updateProfile,
  verifyEmail,
  type ChangePasswordInput,
  type DeleteAccountInput,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
} from "@/lib/api/auth";
import { resetAuthRefreshState } from "@/lib/api/client";
import { authQueryKeys, workflowQueryKeys } from "@/lib/api/query-keys";
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
    // Session user rarely changes outside explicit mutations / login.
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const setUser = (user: User | undefined) => {
    queryClient.setQueryData(authQueryKeys.me, user);
  };

  const clearUser = () => {
    queryClient.removeQueries({ queryKey: authQueryKeys.me });
    queryClient.removeQueries({ queryKey: workflowQueryKeys.dashboardRoot });
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      resetAuthRefreshState();
      setUser(data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      resetAuthRefreshState();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: setUser,
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
  });

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      resetAuthRefreshState();
      setUser(data.user);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerification,
  });

  const logout = (redirectTo: string = authRoutes.login) => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        clearUser();
        router.replace(redirectTo);
      },
    });
  };

  return {
    user: userQuery.data,
    isLoading: fetchUser ? userQuery.isPending && !userQuery.data : false,
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
    updateProfileMutation,
    changePasswordMutation,
    deleteAccountMutation,
    verifyEmailMutation,
    resendVerificationMutation,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}

export type {
  ChangePasswordInput,
  DeleteAccountInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
};
