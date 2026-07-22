"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthAlert, AuthField } from "@/components/auth/auth-field";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { appRoutes, authRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { setPendingVerificationEmail } from "@/lib/auth/pending-verification";
import {
  getAuthFormErrors,
  getErrorMessage,
} from "@/lib/api/get-error-message";
import {
  getFieldErrors,
  registerFormSchema,
} from "@/lib/validation/auth-schemas";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, isRegistering, registerError, resetRegister } = useAuth({
    fetchUser: false,
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
    resetRegister();

    const result = registerFormSchema.safeParse({
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }

    register(
      {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        username: result.data.username.toLowerCase(),
        email: result.data.email.toLowerCase(),
        password: result.data.password,
      },
      {
        onSuccess: (data) => {
          setPendingVerificationEmail(data.email);
          const callbackUrl = searchParams.get("callbackUrl");
          const verifyUrl =
            callbackUrl && callbackUrl.startsWith("/")
              ? `${authRoutes.verifyEmail}?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : authRoutes.verifyEmail;
          router.push(verifyUrl);
        },
        onError: (error) => {
          const apiFieldErrors = getAuthFormErrors(error);
          if (Object.keys(apiFieldErrors).length > 0) {
            setFieldErrors(apiFieldErrors);
          }
        },
      },
    );
  };

  const formError =
    registerError && Object.keys(fieldErrors).length === 0
      ? getErrorMessage(registerError, "Unable to create account")
      : null;

  return (
    <AuthShell
      wide
      badge="Get started"
      title="Create your account"
      description="Fill in your details below. We'll send a verification code to your email."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            maxLength={50}
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              clearFieldError("firstName");
            }}
            placeholder="John"
            error={fieldErrors.firstName}
          />

          <AuthField
            id="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            maxLength={50}
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              clearFieldError("lastName");
            }}
            placeholder="Doe"
            error={fieldErrors.lastName}
          />
        </div>

        <AuthField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          maxLength={30}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value.toLowerCase().replace(/\s/g, ""));
            clearFieldError("username");
          }}
          placeholder="johndoe"
          hint={
            fieldErrors.username
              ? undefined
              : "Lowercase letters, numbers, and underscores only."
          }
          error={fieldErrors.username}
        />

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
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
          placeholder="Create a strong password"
          hint={
            fieldErrors.password
              ? undefined
              : "At least 8 characters, one uppercase letter, and one number."
          }
          error={fieldErrors.password}
        />

        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirmPassword");
          }}
          placeholder="Re-enter your password"
          error={fieldErrors.confirmPassword}
        />

        {formError ? <AuthAlert>{formError}</AuthAlert> : null}

        <AuthSubmitButton
          isPending={isRegistering}
          label="Create account"
          pendingLabel="Creating account..."
        />
      </form>

      <AuthDivider className="my-5" />

      <GoogleSignInButton
        callbackUrl={searchParams.get("callbackUrl") ?? appRoutes.dashboard}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`${authRoutes.login}?callbackUrl=${encodeURIComponent(
            searchParams.get("callbackUrl") ?? appRoutes.dashboard,
          )}`}
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
