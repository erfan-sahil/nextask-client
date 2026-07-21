"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
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
  const workspaces = useQuery({
    queryKey: workflowQueryKeys.workspaces,
    queryFn: () => workflowApi.listWorkspaces({ limit: 100 }),
  });

  const workspaceList = workspaces.data?.workspaces ?? [];
  const projectQueries = useQueries({
    queries: workspaceList.map((workspace) => ({
      queryKey: workflowQueryKeys.projects(workspace._id),
      queryFn: () =>
        workflowApi.listProjects({ workspaceId: workspace._id, limit: 100 }),
    })),
  });
  const memberQueries = useQueries({
    queries: workspaceList.map((workspace) => ({
      queryKey: workflowQueryKeys.workspaceMembers(workspace._id),
      queryFn: () =>
        workflowApi.listWorkspaceMembers({
          workspaceId: workspace._id,
          limit: 100,
        }),
    })),
  });

  const projects = projectQueries.flatMap((query, index) =>
    (query.data?.projects ?? []).map((project) => ({
      ...project,
      workspace: workspaceList[index],
    })),
  );
  const boardQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: workflowQueryKeys.boards(project.workspace._id, project._id),
      queryFn: () =>
        workflowApi.listBoards({
          workspaceId: project.workspace._id,
          projectId: project._id,
          limit: 100,
        }),
    })),
  });

  const boards = boardQueries.flatMap((query, index) =>
    (query.data?.boards ?? []).map((board) => ({
      ...board,
      workspaceId: projects[index].workspace._id,
      projectId: projects[index]._id,
    })),
  );
  const taskQueries = useQueries({
    queries: boards.map((board) => ({
      queryKey: workflowQueryKeys.tasks(
        board.workspaceId,
        board.projectId,
        board._id,
      ),
      queryFn: () =>
        workflowApi.listTasks({
          workspaceId: board.workspaceId,
          projectId: board.projectId,
          boardId: board._id,
          limit: 100,
        }),
    })),
  });

  const tasks = taskQueries.flatMap((query) => query.data?.tasks ?? []);
  const memberIds = new Set(
    memberQueries.flatMap((query) =>
      (query.data?.members ?? []).map((member) => member.userId._id),
    ),
  );
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  weekFromNow.setHours(23, 59, 59, 999);

  const stats: DashboardStats = workspaces.data
    ? {
        activeProjects: projects.filter((project) => project.status === "ACTIVE")
          .length,
        openTasks: tasks.filter((task) => !task.completedAt).length,
        dueThisWeek: tasks.filter(
          (task) =>
            !task.completedAt &&
            task.dueDate !== null &&
            new Date(task.dueDate) >= new Date() &&
            new Date(task.dueDate) <= weekFromNow,
        ).length,
        teamMembers: memberIds.size,
      }
    : EMPTY_STATS;

  return {
    stats,
    projects,
    isLoading:
      workspaces.isLoading ||
      projectQueries.some((query) => query.isLoading) ||
      memberQueries.some((query) => query.isLoading) ||
      boardQueries.some((query) => query.isLoading) ||
      taskQueries.some((query) => query.isLoading),
    isError:
      workspaces.isError ||
      projectQueries.some((query) => query.isError) ||
      memberQueries.some((query) => query.isError) ||
      boardQueries.some((query) => query.isError) ||
      taskQueries.some((query) => query.isError),
  };
}
