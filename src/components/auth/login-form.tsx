"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthAlert, AuthField } from "@/components/auth/auth-field";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authRoutes, appRoutes } from "@/config/navigation";
import { login } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { getFieldErrors, loginFormSchema } from "@/lib/validation/auth-schemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (!data.user.isEmailVerified) {
        router.push(authRoutes.verifyEmail);
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl");
      router.push(
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : appRoutes.dashboard,
      );
    },
  });

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const result = loginFormSchema.safeParse({ email, password });

    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }

    loginMutation.mutate({
      email: result.data.email.toLowerCase(),
      password: result.data.password,
    });
  };

  return (
    <AuthShell
      badge="Welcome back"
      title="Sign in to NexTask"
      description="Access your workspaces, projects, and boards — pick up right where you left off."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          placeholder="Enter your password"
          error={fieldErrors.password}
        />

        {loginMutation.isError ? (
          <AuthAlert>
            {getErrorMessage(loginMutation.error, "Unable to sign in")}
          </AuthAlert>
        ) : null}

        <AuthSubmitButton
          isPending={loginMutation.isPending}
          label="Sign in"
          pendingLabel="Signing in..."
        />
      </form>

      <AuthDivider className="my-5" />

      <GoogleSignInButton
        callbackUrl={searchParams.get("callbackUrl") ?? appRoutes.dashboard}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={authRoutes.register}
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
