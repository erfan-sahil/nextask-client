"use client";

import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
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

/** Small colored letter badge for project items */
const PROJECT_ACCENTS = [
  "bg-primary/15 text-primary",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/20 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
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

  // Derive active workspace from URL, falling back to the first workspace
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0] ?? "";
  const slugFromUrl = !reservedAppSegments.has(firstSegment) ? firstSegment : null;
  const activeWorkspace =
    (slugFromUrl ? mockWorkspaces.find((w) => w.slug === slugFromUrl) : null) ??
    mockWorkspaces[0];

  const workspaceProjects = activeWorkspace
    ? mockProjects.filter((p) => p.workspaceId === activeWorkspace.id)
    : [];

  const allProjectsHref = activeWorkspace
    ? appRoutes.workspace(activeWorkspace.slug)
    : appRoutes.workspaces;

  const isAllProjectsActive =
    pathname === allProjectsHref ||
    (!!activeWorkspace && pathname === `/${activeWorkspace.slug}`);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
        <SiteLogo size="sm" />
      </div>

      {/* Scrollable body */}
      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {/* Workspace Switcher */}
        <div className="mb-2">
          <WorkspaceSwitcher activeWorkspaceId={activeWorkspace?.id} />
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
            href={allProjectsHref}
            icon={FolderKanban}
            label="All Projects"
            active={isAllProjectsActive}
            onClick={onNavigate}
          />
        </nav>

        {/* Workspace Nav */}
        {activeWorkspace && (
          <div className="mt-3">
            <Separator className="mb-3" />
            <div className="mb-1.5 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workspace
              </p>
            </div>
            <nav className="space-y-0.5" aria-label="Workspace navigation">
              <NavLink
                href={appRoutes.workspaceCalendar(activeWorkspace.slug)}
                icon={CalendarDays}
                label="Calendar"
                active={pathname === appRoutes.workspaceCalendar(activeWorkspace.slug)}
                onClick={onNavigate}
              />
              <NavLink
                href={appRoutes.workspaceMembers(activeWorkspace.slug)}
                icon={Users}
                label="Members"
                active={pathname === appRoutes.workspaceMembers(activeWorkspace.slug)}
                onClick={onNavigate}
              />
              <NavLink
                href={appRoutes.workspaceReports(activeWorkspace.slug)}
                icon={BarChart3}
                label="Reports"
                active={pathname === appRoutes.workspaceReports(activeWorkspace.slug)}
                onClick={onNavigate}
              />
            </nav>
          </div>
        )}

        {/* Projects list for current workspace */}
        {workspaceProjects.length > 0 && (
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
              {workspaceProjects.map((project, idx) => {
                const href = appRoutes.project(activeWorkspace!.slug, project.id);
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                const accentClass = PROJECT_ACCENTS[idx % PROJECT_ACCENTS.length];

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
                        accentClass,
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

      {/* Footer — pinned to bottom */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <nav className="mb-3 space-y-0.5" aria-label="Footer navigation">
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
