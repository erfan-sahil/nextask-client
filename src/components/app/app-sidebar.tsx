"use client";

import {
  ChevronRight,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Layers,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { SiteLogo } from "@/components/layout/site-logo";
import { Separator } from "@/components/ui/separator";
import { appRoutes, reservedAppSegments } from "@/config/navigation";
import { mockProjects, mockWorkspaces } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  indent = false,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        indent && "pl-9",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] ?? "";
  const workspaceSlug = !reservedAppSegments.has(firstSegment) ? firstSegment : null;
  const activeWorkspace = workspaceSlug
    ? mockWorkspaces.find((w) => w.slug === workspaceSlug)
    : null;
  const workspaceProjects = activeWorkspace
    ? mockProjects.filter((p) => p.workspaceId === activeWorkspace.id)
    : [];

  const activeProjectId = pathSegments[2]; // /{slug}/projects/{projectId}

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <SiteLogo size="sm" />
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {/* Workspace Switcher */}
        <div className="mb-2">
          <WorkspaceSwitcher
            activeWorkspaceId={activeWorkspace?.id ?? mockWorkspaces[0]?.id}
          />
        </div>

        {/* Main Nav */}
        <nav className="space-y-0.5" aria-label="Main navigation">
          <NavLink
            href={appRoutes.dashboard}
            icon={LayoutDashboard}
            label="Dashboard"
            active={pathname === appRoutes.dashboard}
            onClick={onNavigate}
          />
          <NavLink
            href={appRoutes.workspaces}
            icon={Layers}
            label="All Workspaces"
            active={pathname === appRoutes.workspaces}
            onClick={onNavigate}
          />
        </nav>

        {/* Workspace-scoped Projects */}
        {activeWorkspace && workspaceProjects.length > 0 && (
          <div className="mt-3">
            <Separator className="mb-3" />
            <div className="mb-1.5 flex items-center justify-between px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Projects
              </p>
              <button
                type="button"
                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                aria-label="New project"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <nav className="space-y-0.5" aria-label="Project navigation">
              {workspaceProjects.map((project) => {
                const href = appRoutes.project(activeWorkspace.slug, project.id);
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={project.id}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded text-[0.6rem] font-bold",
                        project.color
                          .replace("border-", "")
                          .split(" ")
                          .find((c) => c.startsWith("bg-")) ?? "bg-primary/10 text-primary",
                      )}
                    >
                      {project.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">{project.name}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <nav className="space-y-0.5 mb-3" aria-label="Footer navigation">
          <NavLink
            href={appRoutes.inbox}
            icon={Inbox}
            label="Inbox"
            active={pathname === appRoutes.inbox}
            onClick={onNavigate}
          />
          <NavLink
            href={appRoutes.settings}
            icon={Settings}
            label="Settings"
            active={pathname === appRoutes.settings}
            onClick={onNavigate}
          />
        </nav>

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
