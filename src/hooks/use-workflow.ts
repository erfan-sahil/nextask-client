"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workflowApi } from "@/lib/api/workflow";
import { workflowQueryKeys } from "@/lib/api/query-keys";

export function useWorkspaces() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: workflowQueryKeys.workspaces,
    queryFn: () => workflowApi.listWorkspaces({ limit: 100 }),
  });

  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createWorkspace,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: workflowQueryKeys.workspaces }),
    }),
    update: useMutation({
      mutationFn: ({ workspaceId, ...data }: { workspaceId: string; name?: string; slug?: string; description?: string; visibility?: "PRIVATE" | "TEAM" | "PUBLIC"; status?: "ACTIVE" | "ARCHIVED" }) =>
        workflowApi.updateWorkspace(workspaceId, data),
      onSuccess: (_, input) => {
        queryClient.invalidateQueries({ queryKey: workflowQueryKeys.workspaces });
        queryClient.invalidateQueries({ queryKey: workflowQueryKeys.workspace(input.workspaceId) });
      },
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteWorkspace,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: workflowQueryKeys.workspaces }),
    }),
  };
}

export function useWorkspaceBySlug(slug: string) {
  const workspaces = useWorkspaces();
  return {
    ...workspaces,
    workspace: workspaces.data?.workspaces.find((item) => item.slug === slug),
  };
}

export function useProjects(workspaceId?: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: workflowQueryKeys.projects(workspaceId ?? ""),
    queryFn: () => workflowApi.listProjects({ workspaceId: workspaceId!, limit: 100 }),
    enabled: Boolean(workspaceId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: workflowQueryKeys.projects(workspaceId ?? "") });

  return {
    ...query,
    create: useMutation({ mutationFn: workflowApi.createProject, onSuccess: invalidate }),
    update: useMutation({ mutationFn: workflowApi.updateProject, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: workflowApi.deleteProject, onSuccess: invalidate }),
  };
}

export function useProject(workspaceId?: string, projectId?: string) {
  return useQuery({
    queryKey: workflowQueryKeys.project(workspaceId ?? "", projectId ?? ""),
    queryFn: () => workflowApi.getProject({ workspaceId: workspaceId!, projectId: projectId! }),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useBoards(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.boards(workspaceId ?? "", projectId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () => workflowApi.listBoards({ workspaceId: workspaceId!, projectId: projectId!, limit: 100 }),
    enabled: Boolean(workspaceId && projectId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    create: useMutation({ mutationFn: workflowApi.createBoard, onSuccess: invalidate }),
    update: useMutation({ mutationFn: workflowApi.updateBoard, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: workflowApi.deleteBoard, onSuccess: invalidate }),
  };
}

export function useKanban(workspaceId?: string, projectId?: string, boardId?: string) {
  const queryClient = useQueryClient();
  const columnsKey = workflowQueryKeys.columns(workspaceId ?? "", projectId ?? "", boardId ?? "");
  const tasksKey = workflowQueryKeys.tasks(workspaceId ?? "", projectId ?? "", boardId ?? "");
  const enabled = Boolean(workspaceId && projectId && boardId);
  const columns = useQuery({
    queryKey: columnsKey,
    queryFn: () => workflowApi.listColumns({ workspaceId: workspaceId!, projectId: projectId!, boardId: boardId! }),
    enabled,
  });
  const tasks = useQuery({
    queryKey: tasksKey,
    queryFn: () => workflowApi.listTasks({ workspaceId: workspaceId!, projectId: projectId!, boardId: boardId! }),
    enabled,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: columnsKey });
    queryClient.invalidateQueries({ queryKey: tasksKey });
  };
  return {
    columns,
    tasks,
    createColumn: useMutation({ mutationFn: workflowApi.createColumn, onSuccess: invalidate }),
    updateColumn: useMutation({ mutationFn: workflowApi.updateColumn, onSuccess: invalidate }),
    deleteColumn: useMutation({ mutationFn: workflowApi.deleteColumn, onSuccess: invalidate }),
    createTask: useMutation({ mutationFn: workflowApi.createTask, onSuccess: invalidate }),
    updateTask: useMutation({ mutationFn: workflowApi.updateTask, onSuccess: invalidate }),
    deleteTask: useMutation({ mutationFn: workflowApi.deleteTask, onSuccess: invalidate }),
  };
}

export function useWorkspaceMembers(workspaceId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.workspaceMembers(workspaceId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () => workflowApi.listWorkspaceMembers({ workspaceId: workspaceId!, limit: 100 }),
    enabled: Boolean(workspaceId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    invite: useMutation({ mutationFn: workflowApi.inviteWorkspaceMember, onSuccess: invalidate }),
    updateRole: useMutation({ mutationFn: workflowApi.updateWorkspaceMember, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: workflowApi.deleteWorkspaceMember, onSuccess: invalidate }),
  };
}

export function useProjectMembers(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.projectMembers(workspaceId ?? "", projectId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () => workflowApi.listProjectMembers({ workspaceId: workspaceId!, projectId: projectId!, limit: 100 }),
    enabled: Boolean(workspaceId && projectId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    invite: useMutation({ mutationFn: workflowApi.inviteProjectMember, onSuccess: invalidate }),
    updateRole: useMutation({ mutationFn: workflowApi.updateProjectMember, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: workflowApi.deleteProjectMember, onSuccess: invalidate }),
  };
}

export function useTaskComments(
  workspaceId?: string,
  projectId?: string,
  boardId?: string,
  taskId?: string,
) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.comments(workspaceId ?? "", projectId ?? "", boardId ?? "", taskId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () => workflowApi.listComments({ workspaceId: workspaceId!, projectId: projectId!, boardId: boardId!, taskId: taskId!, limit: 100 }),
    enabled: Boolean(workspaceId && projectId && boardId && taskId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    create: useMutation({ mutationFn: workflowApi.createComment, onSuccess: invalidate }),
    update: useMutation({ mutationFn: workflowApi.updateComment, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: workflowApi.deleteComment, onSuccess: invalidate }),
  };
}
