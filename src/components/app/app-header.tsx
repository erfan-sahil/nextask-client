"use client";

import { LogOut, Menu, PanelLeft, PanelLeftClose, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppNavIcon, NotificationIcon } from "@/components/app/app-nav-icon";
import { UserAvatar } from "@/components/app/user-avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-workflow";
import type { User as AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  user: AuthUser;
  className?: string;
};

export function UserMenu({ user, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, isLoggingOut } = useAuth({ fetchUser: false });
  const displayName = `${user.firstName} ${user.lastName}`.trim();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pr-3 pl-1 transition-colors hover:bg-muted"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <UserAvatar name={displayName} avatar={user.avatar} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
          {user.firstName}
        </span>
      </button>

      {isOpen ? (
        <div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          role="menu"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="p-1.5">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <User className="size-4 text-muted-foreground" />
              Profile
            </button>
            <Link
              href="/dashboard#settings"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              <AppNavIcon icon="settings" className="size-4 text-muted-foreground" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type AppHeaderProps = {
  user: AuthUser;
  title?: string;
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
};

export function AppHeader({
  user,
  title = "Dashboard",
  onMenuClick,
  onSidebarToggle,
  sidebarOpen = true,
}: AppHeaderProps) {
  const notifications = useNotifications();
  const unreadCount = notifications.data?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile: opens Sheet */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Desktop: collapses/expands sidebar */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden lg:flex"
        onClick={onSidebarToggle}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="size-5" />
        ) : (
          <PanelLeft className="size-5" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Workspaces, projects, boards, and tasks — all in one place.
        </p>
      </div>

      <div className="hidden max-w-sm flex-1 md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks, projects, comments..."
            className="h-9 rounded-full border-border bg-muted/50 pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/inbox"
          aria-label="Notifications"
          className="relative inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <NotificationIcon className="size-4" />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />}
        </Link>
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
