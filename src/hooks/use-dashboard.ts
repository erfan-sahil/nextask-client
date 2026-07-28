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

export function useDashboard() {
  const dashboard = useQuery({
    queryKey: workflowQueryKeys.dashboard,
    queryFn: () => workflowApi.getDashboard(),
  });

  return {
    stats: dashboard.data?.stats ?? EMPTY_STATS,
    projects: dashboard.data?.projects ?? [],
    myTasks: dashboard.data?.myTasks ?? [],
    upcomingTasks: dashboard.data?.upcomingTasks ?? [],
    upcomingMeetings: dashboard.data?.upcomingMeetings ?? [],
    recentActivity: dashboard.data?.recentActivity ?? [],
    isLoading: dashboard.isLoading,
    isError: dashboard.isError,
  };
}
