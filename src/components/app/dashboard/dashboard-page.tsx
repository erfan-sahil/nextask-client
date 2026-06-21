"use client";

import { useQuery } from "@tanstack/react-query";
import { BoardPreview } from "@/components/app/dashboard/board-preview";
import { ProjectGrid } from "@/components/app/dashboard/project-grid";
import { QuickActions } from "@/components/app/dashboard/quick-actions";
import { RecentActivity } from "@/components/app/dashboard/recent-activity";
import { RecentComments } from "@/components/app/dashboard/recent-comments";
import { StatsOverview } from "@/components/app/dashboard/stats-overview";
import { WelcomeHeader } from "@/components/app/dashboard/welcome-header";
import { WorkspaceGrid } from "@/components/app/dashboard/workspace-grid";
import { getMe } from "@/lib/api/auth";
import { authQueryKeys } from "@/lib/api/query-keys";
import {
  mockActivity,
  mockBoard,
  mockComments,
  mockDashboardStats,
  mockProjects,
  mockWorkspaces,
} from "@/lib/mock/dashboard-data";

export function DashboardPage() {
  const meQuery = useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
  });

  if (!meQuery.data) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
      <WelcomeHeader user={meQuery.data} />
      <StatsOverview stats={mockDashboardStats} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <WorkspaceGrid workspaces={mockWorkspaces} />
          <ProjectGrid projects={mockProjects} />
          <BoardPreview board={mockBoard} />
        </div>

        <aside className="space-y-8">
          <QuickActions />
          <RecentActivity activity={mockActivity} />
          <RecentComments comments={mockComments} />
        </aside>
      </div>
    </div>
  );
}
