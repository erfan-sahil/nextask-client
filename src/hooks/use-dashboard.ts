"use client";

import { useQuery } from "@tanstack/react-query";
import { workflowApi } from "@/lib/api/workflow";
import { workflowQueryKeys } from "@/lib/api/query-keys";
import type { DashboardStats } from "@/types/workspace";

const EMPTY_STATS: DashboardStats = {
  activeProjects: 0,
  openTasks: 0,
  dueThisWeek: 0,
  teamMembers: 0,
};

export function useDashboard(userId?: string) {
  const dashboard = useQuery({
    queryKey: workflowQueryKeys.dashboard(userId ?? ""),
    queryFn: () => workflowApi.getDashboard(),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });

  return {
    stats: dashboard.data?.stats ?? EMPTY_STATS,
    myTasks: dashboard.data?.myTasks ?? [],
    upcomingTasks: dashboard.data?.upcomingTasks ?? [],
    upcomingMeetings: dashboard.data?.upcomingMeetings ?? [],
    recentActivity: dashboard.data?.recentActivity ?? [],
    isLoading: dashboard.isLoading,
    isError: dashboard.isError,
  };
}
