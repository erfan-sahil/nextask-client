"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authRoutes, appRoutes } from "@/config/navigation";
import { getMe } from "@/lib/api/auth";
import { authQueryKeys } from "@/lib/api/query-keys";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isGuestOnlyRoute =
    pathname === authRoutes.login || pathname === authRoutes.register;
  const callbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : null;

  const meQuery = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    retry: false,
    enabled: isGuestOnlyRoute,
  });

  useEffect(() => {
    if (!isGuestOnlyRoute || !meQuery.data) {
      return;
    }

    if (meQuery.data.isEmailVerified) {
      router.replace(safeCallbackUrl ?? appRoutes.dashboard);
      return;
    }

    router.replace(
      safeCallbackUrl
        ? `${authRoutes.verifyEmail}?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
        : authRoutes.verifyEmail,
    );
  }, [isGuestOnlyRoute, meQuery.data, router, safeCallbackUrl]);

  const isRedirecting = isGuestOnlyRoute && meQuery.isSuccess;

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-primary-light/50 blur-3xl dark:bg-primary/10" />
        <div className="absolute -bottom-40 -left-32 size-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary-light/20" />
        <div className="absolute top-1/3 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary-light/30 blur-3xl dark:bg-primary/5" />
      </div>

      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        {isRedirecting ? (
          <div
            className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
            aria-label="Redirecting"
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return <AuthLayoutContent>{children}</AuthLayoutContent>;
}
