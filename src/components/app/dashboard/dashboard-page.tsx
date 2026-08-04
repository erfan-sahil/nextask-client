"use client";

import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardTaskList } from "@/components/app/dashboard/dashboard-task-list";
import { RecentActivity } from "@/components/app/dashboard/recent-activity";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { UpcomingMeetings } from "@/components/app/dashboard/upcoming-meetings";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { appRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { user } = useAuth();
  const dashboard = useDashboard(user?._id);

  if (!user) return null;

  const isEmpty =
    !dashboard.isLoading &&
    !dashboard.isError &&
    dashboard.stats.activeProjects === 0 &&
    dashboard.stats.openTasks === 0 &&
    dashboard.stats.dueThisWeek === 0 &&
    dashboard.stats.teamMembers === 0 &&
    dashboard.myTasks.length === 0 &&
    dashboard.upcomingTasks.length === 0 &&
    dashboard.upcomingMeetings.length === 0 &&
    dashboard.recentActivity.length === 0;

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

      {dashboard.isLoading ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Loading dashboard data…
        </p>
      ) : dashboard.isError || isEmpty ? (
        <EmptyState
          icon={FolderKanban}
          title="Nothing to show yet"
          description="Create a workspace and add a project to see your tasks, meetings, and activity here."
          action={
            <Link
              href={appRoutes.workspaces}
              className={cn(buttonVariants({ size: "page" }))}
            >
              <Plus className="size-4" />
              Create workspace
            </Link>
          }
        />
      ) : (
        <>
          <StatsOverview stats={dashboard.stats} />

          <div className="grid items-start gap-6 xl:grid-cols-3">
            <DashboardTaskList
              title="My current tasks"
              tasks={dashboard.myTasks}
              emptyMessage="You have no open tasks assigned to you."
            />
            <DashboardTaskList
              title="Upcoming tasks"
              tasks={dashboard.upcomingTasks}
              emptyMessage="You have no upcoming tasks."
            />
            <UpcomingMeetings meetings={dashboard.upcomingMeetings} />
          </div>

          <RecentActivity activity={dashboard.recentActivity} />
        </>
      )}
    </div>
  );
}
