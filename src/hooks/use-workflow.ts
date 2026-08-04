"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { workflowApi } from "@/lib/api/workflow";
import { workflowQueryKeys } from "@/lib/api/query-keys";
import type {
  CalendarEventDoc,
  ListResult,
  NotificationDoc,
  TaskDoc,
  WorkspaceChatMessageDoc,
} from "@/types/domain";
import { socket } from "@/lib/socket";

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
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: workflowQueryKeys.workspaces,
        }),
    }),
    update: useMutation({
      mutationFn: ({
        workspaceId,
        ...data
      }: {
        workspaceId: string;
        name?: string;
        slug?: string;
        description?: string;
        visibility?: "PRIVATE" | "TEAM" | "PUBLIC";
        status?: "ACTIVE" | "ARCHIVED";
      }) => workflowApi.updateWorkspace(workspaceId, data),
      onSuccess: (_, input) => {
        queryClient.invalidateQueries({
          queryKey: workflowQueryKeys.workspaces,
        });
        queryClient.invalidateQueries({
          queryKey: workflowQueryKeys.workspace(input.workspaceId),
        });
      },
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteWorkspace,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: workflowQueryKeys.workspaces,
        }),
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

export function useGoals(workspaceId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.goals(workspaceId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.listGoals({ workspaceId: workspaceId!, limit: 100 }),
    enabled: Boolean(workspaceId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createGoal,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: workflowApi.updateGoal,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteGoal,
      onSuccess: invalidate,
    }),
  };
}

export function useCalendar(
  workspaceId: string | undefined,
  startDate: string,
  endDate: string,
) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.calendar(workspaceId ?? "", startDate, endDate);
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.getCalendarEvents({
        workspaceId: workspaceId!,
        startDate,
        endDate,
      }),
    enabled: Boolean(workspaceId),
  });

  return {
    ...query,
    events: query.data ?? ([] as CalendarEventDoc[]),
    createMeeting: useMutation({
      mutationFn: workflowApi.createMeeting,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ["workspaces", workspaceId, "calendar"],
        }),
    }),
    updateMeeting: useMutation({
      mutationFn: workflowApi.updateMeeting,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ["workspaces", workspaceId, "calendar"],
        }),
    }),
    deleteMeeting: useMutation({
      mutationFn: workflowApi.deleteMeeting,
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: ["workspaces", workspaceId, "calendar"],
        }),
    }),
  };
}

export function useProjects(workspaceId?: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: workflowQueryKeys.projects(workspaceId ?? ""),
    queryFn: () =>
      workflowApi.listProjects({ workspaceId: workspaceId!, limit: 100 }),
    enabled: Boolean(workspaceId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: workflowQueryKeys.projects(workspaceId ?? ""),
    });

  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createProject,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: workflowApi.updateProject,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteProject,
      onSuccess: invalidate,
    }),
  };
}

export function useProject(workspaceId?: string, projectId?: string) {
  return useQuery({
    queryKey: workflowQueryKeys.project(workspaceId ?? "", projectId ?? ""),
    queryFn: () =>
      workflowApi.getProject({
        workspaceId: workspaceId!,
        projectId: projectId!,
      }),
    enabled: Boolean(workspaceId && projectId),
  });
}

export function useBoards(workspaceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.boards(workspaceId ?? "", projectId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.listBoards({
        workspaceId: workspaceId!,
        projectId: projectId!,
        limit: 100,
      }),
    enabled: Boolean(workspaceId && projectId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createBoard,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: workflowApi.updateBoard,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteBoard,
      onSuccess: invalidate,
    }),
  };
}

export function useKanban(
  workspaceId?: string,
  projectId?: string,
  boardId?: string,
) {
  const queryClient = useQueryClient();
  const columnsKey = workflowQueryKeys.columns(
    workspaceId ?? "",
    projectId ?? "",
    boardId ?? "",
  );
  const tasksKey = workflowQueryKeys.tasks(
    workspaceId ?? "",
    projectId ?? "",
    boardId ?? "",
  );
  const enabled = Boolean(workspaceId && projectId && boardId);
  const columns = useQuery({
    queryKey: columnsKey,
    queryFn: () =>
      workflowApi.listColumns({
        workspaceId: workspaceId!,
        projectId: projectId!,
        boardId: boardId!,
      }),
    enabled,
  });
  const tasks = useQuery({
    queryKey: tasksKey,
    queryFn: () =>
      workflowApi.listTasks({
        workspaceId: workspaceId!,
        projectId: projectId!,
        boardId: boardId!,
      }),
    enabled,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: columnsKey });
    queryClient.invalidateQueries({ queryKey: tasksKey });
    queryClient.invalidateQueries({
      queryKey: workflowQueryKeys.reports(workspaceId ?? ""),
    });
  };
  const taskColumnId = (task: TaskDoc) =>
    typeof task.columnId === "string" ? task.columnId : task.columnId._id;

  return {
    columns,
    tasks,
    createColumn: useMutation({
      mutationFn: workflowApi.createColumn,
      onSuccess: invalidate,
    }),
    updateColumn: useMutation({
      mutationFn: workflowApi.updateColumn,
      onSuccess: invalidate,
    }),
    deleteColumn: useMutation({
      mutationFn: workflowApi.deleteColumn,
      onSuccess: invalidate,
    }),
    createTask: useMutation({
      mutationFn: workflowApi.createTask,
      onSuccess: invalidate,
    }),
    updateTask: useMutation({
      mutationFn: workflowApi.updateTask,
      onMutate: async (input) => {
        if (input.position === undefined && input.columnId === undefined) {
          return;
        }

        await queryClient.cancelQueries({ queryKey: tasksKey });
        const previousTasks =
          queryClient.getQueryData<ListResult<TaskDoc, "tasks">>(tasksKey);

        if (!previousTasks) {
          return;
        }

        const task = previousTasks.tasks.find(
          (item) => item._id === input.taskId,
        );

        if (!task) {
          return { previousTasks };
        }

        const sourceColumnId = taskColumnId(task);
        const destinationColumnId = input.columnId ?? sourceColumnId;
        const sourceTasks = previousTasks.tasks.filter(
          (item) =>
            taskColumnId(item) === sourceColumnId && item._id !== task._id,
        );
        const destinationTasks =
          destinationColumnId === sourceColumnId
            ? sourceTasks
            : previousTasks.tasks.filter(
                (item) =>
                  taskColumnId(item) === destinationColumnId &&
                  item._id !== task._id,
              );
        const targetPosition = Math.min(
          Math.max(input.position ?? destinationTasks.length, 0),
          destinationTasks.length,
        );

        destinationTasks.splice(targetPosition, 0, {
          ...task,
          columnId: destinationColumnId,
        });

        const nextPositions = new Map<string, number>();
        sourceTasks.forEach((item, index) =>
          nextPositions.set(item._id, index),
        );
        destinationTasks.forEach((item, index) =>
          nextPositions.set(item._id, index),
        );

        queryClient.setQueryData<ListResult<TaskDoc, "tasks">>(tasksKey, {
          ...previousTasks,
          tasks: previousTasks.tasks.map((item) => {
            const position = nextPositions.get(item._id);

            if (position === undefined) {
              return item;
            }

            return {
              ...item,
              columnId:
                item._id === task._id ? destinationColumnId : item.columnId,
              position,
            };
          }),
        });

        return { previousTasks };
      },
      onError: (_error, _input, context) => {
        if (context?.previousTasks) {
          queryClient.setQueryData(tasksKey, context.previousTasks);
        }
      },
      onSettled: invalidate,
    }),
    deleteTask: useMutation({
      mutationFn: workflowApi.deleteTask,
      onSuccess: invalidate,
    }),
  };
}

export function useWorkspaceMembers(workspaceId?: string, enabled = true) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.workspaceMembers(workspaceId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.listWorkspaceMembers({
        workspaceId: workspaceId!,
        limit: 100,
      }),
    enabled: Boolean(workspaceId) && enabled,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    invite: useMutation({
      mutationFn: workflowApi.inviteWorkspaceMember,
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: workflowApi.updateWorkspaceMember,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteWorkspaceMember,
      onSuccess: invalidate,
    }),
  };
}

export function useProjectMembers(
  workspaceId?: string,
  projectId?: string,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.projectMembers(
    workspaceId ?? "",
    projectId ?? "",
  );
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.listProjectMembers({
        workspaceId: workspaceId!,
        projectId: projectId!,
        limit: 100,
      }),
    enabled: Boolean(workspaceId && projectId) && enabled,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    ...query,
    invite: useMutation({
      mutationFn: workflowApi.inviteProjectMember,
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: workflowApi.updateProjectMember,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteProjectMember,
      onSuccess: invalidate,
    }),
  };
}

export function useTaskComments(
  workspaceId?: string,
  projectId?: string,
  boardId?: string,
  taskId?: string,
) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.comments(
    workspaceId ?? "",
    projectId ?? "",
    boardId ?? "",
    taskId ?? "",
  );
  const tasksKey = workflowQueryKeys.tasks(
    workspaceId ?? "",
    projectId ?? "",
    boardId ?? "",
  );
  const query = useQuery({
    queryKey: key,
    queryFn: () =>
      workflowApi.listComments({
        workspaceId: workspaceId!,
        projectId: projectId!,
        boardId: boardId!,
        taskId: taskId!,
        limit: 100,
      }),
    enabled: Boolean(workspaceId && projectId && boardId && taskId),
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: tasksKey });
  };
  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createComment,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: workflowApi.updateComment,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: workflowApi.deleteComment,
      onSuccess: invalidate,
    }),
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.notifications;
  const query = useQuery({ queryKey: key, queryFn: workflowApi.listNotifications });

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const onNotification = (notification: NotificationDoc) => {
      const current = queryClient.getQueryData<{
        notifications: NotificationDoc[];
        unreadCount: number;
      } & ListResult<NotificationDoc, "notifications">>(key);

      if (!current) {
        void queryClient.invalidateQueries({ queryKey: key });
        return;
      }

      if (current.notifications.some(({ _id }) => _id === notification._id)) return;

      queryClient.setQueryData(key, {
        ...current,
        notifications: [notification, ...current.notifications],
        unreadCount: current.unreadCount + 1,
      });
    };
    socket.on("notification:created", onNotification);
    return () => {
      socket.off("notification:created", onNotification);
    };
  }, [key, queryClient]);

  return {
    ...query,
    markAllRead: useMutation({
      mutationFn: workflowApi.markAllNotificationsRead,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    }),
    markRead: useMutation({
      mutationFn: workflowApi.markNotificationRead,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    }),
  };
}

export function useWorkspaceChat(workspaceId?: string) {
  const queryClient = useQueryClient();
  const key = workflowQueryKeys.chat(workspaceId ?? "");
  const query = useQuery({
    queryKey: key,
    queryFn: () => workflowApi.listChatMessages(workspaceId!),
    enabled: Boolean(workspaceId),
  });

  useEffect(() => {
    if (!workspaceId) return;
    if (!socket.connected) socket.connect();
    socket.emit("workspace:join", workspaceId);
    const onMessage = (message: WorkspaceChatMessageDoc) => {
      queryClient.setQueryData<ListResult<WorkspaceChatMessageDoc, "messages">>(
        key,
        (current) => {
          if (!current || current.messages.some(({ _id }) => _id === message._id)) {
            return current;
          }

          return { ...current, messages: [...current.messages, message] };
        },
      );
    };
    socket.on("chat:message", onMessage);
    return () => {
      socket.emit("workspace:leave", workspaceId);
      socket.off("chat:message", onMessage);
    };
  }, [key, queryClient, workspaceId]);

  return {
    ...query,
    create: useMutation({
      mutationFn: workflowApi.createChatMessage,
    }),
  };
}

export function useWorkspaceChatParticipants(workspaceId?: string) {
  return useQuery({
    queryKey: workflowQueryKeys.chatMembers(workspaceId ?? ""),
    queryFn: () => workflowApi.listChatParticipants(workspaceId!),
    enabled: Boolean(workspaceId),
    staleTime: 5 * 60 * 1000,
  });
}
