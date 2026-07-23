"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { WorkspaceChat } from "@/components/app/workspace-chat";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { authRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workflow";
import { cn } from "@/lib/utils";
import { reservedAppSegments } from "@/config/navigation";

const SIDEBAR_STORAGE_KEY = "nextask-sidebar-open";

function AppShellContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading, isError } = useAuth();
  const workspaces = useWorkspaces();
  const needsEmailVerification = Boolean(user && !user.isEmailVerified);
  const firstSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const workspaceSlug = reservedAppSegments.has(firstSegment) ? undefined : firstSegment;
  const activeWorkspace =
    workspaces.data?.workspaces.find((workspace) => workspace.slug === workspaceSlug) ??
    workspaces.data?.workspaces[0];

  // Restore persisted sidebar preference after mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) setSidebarOpen(stored === "true");
  }, []);

  function toggleSidebar() {
    setSidebarOpen((prev) => {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!prev));
      return !prev;
    });
  }

  useEffect(() => {
    if (isError) {
      router.replace(authRoutes.login);
      return;
    }

    if (needsEmailVerification) {
      router.replace(authRoutes.verifyEmail);
    }
  }, [needsEmailVerification, isError, router]);

  if (isLoading || isError || !user || needsEmailVerification) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-label="Loading workspace"
        />
      </div>
    );
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Desktop sidebar — collapses with a width transition */}
      <div
        className={cn(
          "hidden shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out lg:block",
          sidebarOpen ? "w-64" : "w-0",
        )}
      >
        <AppSidebar className="h-full w-64" />
      </div>

      {/* Mobile sidebar — Sheet slide-over */}
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
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setMobileNavOpen(true)}
          onSidebarToggle={toggleSidebar}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
      <WorkspaceChat workspace={activeWorkspace} />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AppShellContent>{children}</AppShellContent>;
}
