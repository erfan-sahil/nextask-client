"use client";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardTaskList } from "@/components/app/dashboard/dashboard-task-list";
import { RecentActivity } from "@/components/app/dashboard/recent-activity";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { UpcomingMeetings } from "@/components/app/dashboard/upcoming-meetings";
import { appRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";

const PROJECT_ACCENTS = [
  "bg-primary/10 text-primary",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
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
            {dashboard.projects.map((project, index) => (
              <Link
                key={project._id}
                href={appRoutes.project(project.workspace.slug, project._id)}
                className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-muted/40 dark:hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${PROJECT_ACCENTS[index % PROJECT_ACCENTS.length]}`}
                  >
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                      {project.description || "No description yet"}
                    </span>
                  </span>
                </div>
                <div className="my-4 h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full bg-primary" />
                    {project.taskCount} task{project.taskCount === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground/70">
                    <TrendingUp className="size-3" />
                    {formatStatus(project.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {!dashboard.isLoading && !dashboard.isError && (
        <>
          <div className="grid items-start gap-6 xl:grid-cols-3">
            <DashboardTaskList
              title="My current tasks"
              tasks={dashboard.myTasks}
              emptyMessage="You have no open tasks assigned to you."
            />
            <DashboardTaskList
              title="Upcoming tasks"
              tasks={dashboard.upcomingTasks}
              emptyMessage="You have no backlog, overdue, or upcoming tasks."
            />
            <UpcomingMeetings meetings={dashboard.upcomingMeetings} />
          </div>
          <RecentActivity activity={dashboard.recentActivity} />
        </>
      )}
    </div>
  );
}
