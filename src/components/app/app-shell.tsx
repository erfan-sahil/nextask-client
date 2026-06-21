"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { authRoutes } from "@/config/navigation";
import { getMe } from "@/lib/api/auth";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError) {
      router.replace(authRoutes.login);
      return;
    }

    if (meQuery.data && !meQuery.data.isEmailVerified) {
      router.replace(authRoutes.verifyEmail);
    }
  }, [meQuery.data, meQuery.isError, router]);

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return null;
  }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar className="hidden lg:flex" />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar
            className="w-full border-r-0"
            onNavigate={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={meQuery.data}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppShellContent>{children}</AppShellContent>
    </QueryProvider>
  );
}
