"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { register } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/get-error-message";

const inputClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

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
      router.push("/verify-email");
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
      title="Create your NexTask account"
      description="Fill in your details below. We'll send a verification code to your email."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-foreground"
            >
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              required
              maxLength={50}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={inputClassName}
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-foreground"
            >
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              required
              maxLength={50}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={inputClassName}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            maxLength={30}
            value={username}
            onChange={(event) =>
              setUsername(event.target.value.toLowerCase().replace(/\s/g, ""))
            }
            className={inputClassName}
            placeholder="johndoe"
          />
          <p className="text-xs text-muted-foreground">
            Lowercase letters, numbers, and underscores only.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="Create a strong password"
          />
          <p className="text-xs text-muted-foreground">
            At least 8 characters, one uppercase letter, and one number.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClassName}
            placeholder="Re-enter your password"
          />
        </div>

        {clientError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {clientError}
          </p>
        ) : null}

        {registerMutation.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(registerMutation.error, "Unable to create account")}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/verify-email"
          className="font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Verify your email
        </Link>
      </p>
    </AuthShell>
  );
}
