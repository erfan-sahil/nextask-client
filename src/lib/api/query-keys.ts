export const authQueryKeys = {
  me: ["me"] as const,
};

export const workflowQueryKeys = {
  workspaces: ["workspaces"] as const,
  workspace: (workspaceId: string) => ["workspaces", workspaceId] as const,
  projects: (workspaceId: string) =>
    ["workspaces", workspaceId, "projects"] as const,
  project: (workspaceId: string, projectId: string) =>
    ["workspaces", workspaceId, "projects", projectId] as const,
  boards: (workspaceId: string, projectId: string) =>
    ["workspaces", workspaceId, "projects", projectId, "boards"] as const,
  board: (workspaceId: string, projectId: string, boardId: string) =>
    [
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "boards",
      boardId,
    ] as const,
  columns: (workspaceId: string, projectId: string, boardId: string) =>
    [
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "boards",
      boardId,
      "columns",
    ] as const,
  tasks: (workspaceId: string, projectId: string, boardId: string) =>
    [
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "boards",
      boardId,
      "tasks",
    ] as const,
  workspaceMembers: (workspaceId: string) =>
    ["workspaces", workspaceId, "members"] as const,
  goals: (workspaceId: string) => ["workspaces", workspaceId, "goals"] as const,
  calendar: (workspaceId: string, startDate: string, endDate: string) =>
    ["workspaces", workspaceId, "calendar", startDate, endDate] as const,
  projectMembers: (workspaceId: string, projectId: string) =>
    ["workspaces", workspaceId, "projects", projectId, "members"] as const,
  comments: (
    workspaceId: string,
    projectId: string,
    boardId: string,
    taskId: string,
  ) =>
    [
      "workspaces",
      workspaceId,
      "projects",
      projectId,
      "boards",
      boardId,
      "tasks",
      taskId,
      "comments",
    ] as const,
  notifications: ["notifications"] as const,
  chat: (workspaceId: string) => ["workspaces", workspaceId, "chat"] as const,
  chatMembers: (workspaceId: string) =>
    ["workspaces", workspaceId, "chat", "members"] as const,
};
