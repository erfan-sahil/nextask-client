"use client";

import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { appRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { user } = useAuth();
  const dashboard = useDashboard();

  if (!user) return null;

  return (
    <div className="space-y-8 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your workspaces today.
        </p>
      </div>

      {/* Stats */}
      <StatsOverview stats={dashboard.stats} />

      <section aria-label="Projects">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Your projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Projects from your workspaces, loaded from NexTask.
          </p>
        </div>
        {dashboard.isLoading ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Loading dashboard data…
          </p>
        ) : dashboard.isError ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            Unable to load dashboard data. Please try again.
          </p>
        ) : dashboard.projects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No projects yet. Create a workspace and add your first project.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.projects.map((project) => (
              <Link
                key={project._id}
                href={appRoutes.project(project.workspace.slug, project._id)}
                className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <FolderKanban className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold group-hover:text-primary">
                  {project.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {project.description || "No description"}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {project.taskCount} task{project.taskCount === 1 ? "" : "s"} ·{" "}
                  {project.status.replace("_", " ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
