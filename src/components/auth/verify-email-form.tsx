"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { appRoutes, authRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getMe, resendVerification, verifyEmail } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { authQueryKeys } from "@/lib/api/query-keys";

const OTP_LENGTH = 6;

export function VerifyEmailForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, isLoggingOut } = useAuth({ fetchUser: false });
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendCooldown, setResendCooldown] = useState(0);

  const meQuery = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    retry: false,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.me, data.user);
      router.replace(appRoutes.dashboard);
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      setResendCooldown(60);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      const match = message.match(/wait (\d+) seconds/i);

      if (match) {
        setResendCooldown(Number(match[1]));
      }
    },
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.replace(authRoutes.register);
    }
  }, [meQuery.isError, router]);

  useEffect(() => {
    if (meQuery.data?.isEmailVerified) {
      router.replace(appRoutes.dashboard);
    }
  }, [meQuery.data, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const otp = digits.join("");

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);

    setDigits((current) => {
      const next = [...current];
      next[index] = sanitized;
      return next;
    });

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH)
      .fill("")
      .map((_, index) => pasted[index] ?? "");

    setDigits(nextDigits);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (otp.length !== OTP_LENGTH) return;

    verifyMutation.mutate({ otp });
  };

  if (meQuery.isLoading) {
    return (
      <AuthShell
        badge="Email verification"
        title="Checking your session"
        description="Please wait while we load your account."
      >
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthShell>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return null;
  }

  return (
    <AuthShell
      badge="Email verification"
      title="Verify your email"
      description={`Enter the 6-digit code we sent to ${meQuery.data.email}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(event) => updateDigit(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              className="h-12 w-10 rounded-xl border border-border bg-background text-center text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary sm:h-14 sm:w-12"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {verifyMutation.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(verifyMutation.error, "Unable to verify email")}
          </p>
        ) : null}

        {resendMutation.isError ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {getErrorMessage(resendMutation.error, "Unable to resend code")}
          </p>
        ) : null}

        {resendMutation.isSuccess ? (
          <p className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
            A new verification code has been sent to your email.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={verifyMutation.isPending || otp.length !== OTP_LENGTH}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-muted">
        <button
          type="button"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending || resendCooldown > 0}
          className="font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : resendMutation.isPending
              ? "Sending..."
              : "Resend verification code"}
        </button>

        <button
          type="button"
          onClick={() => logout(authRoutes.register)}
          disabled={isLoggingOut}
          className="transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Going back..." : "Back to registration"}
        </button>
      </div>
    </AuthShell>
  );
}
