"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthAlert, AuthField } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authRoutes } from "@/config/navigation";
import { register } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/get-error-message";

const validatePassword = (password: string) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
};

const validateUsername = (username: string) => {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length > 30) {
    return "Username must be at most 30 characters";
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Username may only contain lowercase letters, numbers, and underscores";
  }

  return null;
};

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      router.push(authRoutes.verifyEmail);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    const usernameError = validateUsername(username.trim().toLowerCase());
    if (usernameError) {
      setClientError(usernameError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setClientError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }

    registerMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
    });
  };

  return (
    <AuthShell
      wide
      badge="Get started"
      title="Create your account"
      description="Fill in your details below. We'll send a verification code to your email."
      icon={Sparkles}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="firstName"
            label="First name"
            type="text"
            autoComplete="given-name"
            required
            maxLength={50}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="John"
          />

          <AuthField
            id="lastName"
            label="Last name"
            type="text"
            autoComplete="family-name"
            required
            maxLength={50}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Doe"
          />
        </div>

        <AuthField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          required
          maxLength={30}
          value={username}
          onChange={(event) =>
            setUsername(event.target.value.toLowerCase().replace(/\s/g, ""))
          }
          placeholder="johndoe"
          hint="Lowercase letters, numbers, and underscores only."
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a strong password"
          hint="At least 8 characters, one uppercase letter, and one number."
        />

        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your password"
        />

        {clientError ? <AuthAlert>{clientError}</AuthAlert> : null}

        {registerMutation.isError ? (
          <AuthAlert>
            {getErrorMessage(registerMutation.error, "Unable to create account")}
          </AuthAlert>
        ) : null}

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="h-11 w-full rounded-full text-sm font-semibold hover:bg-primary-hover"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
          {!registerMutation.isPending ? (
            <ArrowRight data-icon="inline-end" aria-hidden />
          ) : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={authRoutes.login}
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
