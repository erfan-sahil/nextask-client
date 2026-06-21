"use client";

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
import { useAuth } from "@/hooks/use-auth";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, isLoading, isError } = useAuth();
  useEffect(() => {
    if (isError) {
      router.replace(authRoutes.login);
      return;
    }

    if (user && !user.isEmailVerified) {
      router.replace(authRoutes.verifyEmail);
    }
  }, [user, isError, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  if (isError || !user) {
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
          user={user}
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
