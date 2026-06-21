"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppNavIcon } from "@/components/app/app-nav-icon";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { SiteLogo } from "@/components/layout/site-logo";
import { Separator } from "@/components/ui/separator";
import { appNavItems, appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function isNavActive(pathname: string, href: string) {
  const basePath = href.split("#")[0];

  if (basePath === appRoutes.dashboard && pathname === appRoutes.dashboard) {
    return href === appRoutes.dashboard;
  }

  return pathname === basePath;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  const mainNav = appNavItems.filter((item) => item.section === "main");
  const workspaceNav = appNavItems.filter((item) => item.section === "workspace");
  const footerNav = appNavItems.filter((item) => item.section === "footer");

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <SiteLogo size="sm" />
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        <WorkspaceSwitcher />

        <nav className="space-y-1" aria-label="Main navigation">
          {mainNav.map((item) => {
            const active = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <AppNavIcon icon={item.icon} className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          <nav className="space-y-1" aria-label="Workspace navigation">
            {workspaceNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
              >
                <AppNavIcon icon={item.icon} className="size-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-4">
        <nav className="space-y-1" aria-label="Footer navigation">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60"
            >
              <AppNavIcon icon={item.icon} className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        <div className="rounded-xl border border-primary/15 bg-primary-light/50 p-3 dark:bg-primary-light/10">
          <p className="text-sm font-semibold text-primary">Upgrade your team</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Unlock advanced boards, automations, and workspace analytics.
          </p>
        </div>
      </div>
    </aside>
  );
}
