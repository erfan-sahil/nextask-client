"use client";

import { RecentActivity } from "@/components/app/dashboard/recent-activity";
import { RecentComments } from "@/components/app/dashboard/recent-comments";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { useAuth } from "@/hooks/use-auth";
import {
  mockActivity,
  mockComments,
  mockDashboardStats,
} from "@/lib/mock/dashboard-data";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardPage() {
  const { user } = useAuth();

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
      <StatsOverview stats={mockDashboardStats} />

      {/* Activity & Comments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity activity={mockActivity} />
        <RecentComments comments={mockComments} />
      </div>
    </div>
  );
}
