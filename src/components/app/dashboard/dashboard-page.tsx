"use client";

import { DashboardTaskList } from "@/components/app/dashboard/dashboard-task-list";
import { RecentActivity } from "@/components/app/dashboard/recent-activity";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { UpcomingMeetings } from "@/components/app/dashboard/upcoming-meetings";
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
  const dashboard = useDashboard(user?._id);

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

      {dashboard.isLoading ? (
        <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Loading dashboard data…
        </p>
      ) : dashboard.isError ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          Unable to load dashboard data. Please try again.
        </p>
      ) : (
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
      )}

      {!dashboard.isLoading && !dashboard.isError && (
        <RecentActivity activity={dashboard.recentActivity} />
      )}
    </div>
  );
}
