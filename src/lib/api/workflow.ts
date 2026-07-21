import type { ApiSuccessResponse } from "@/types/api";
import type {
  BoardDoc,
  ColumnDoc,
  ListResult,
  MemberDoc,
  MemberRole,
  ProjectDoc,
  ProjectStatus,
  TaskCommentDoc,
  TaskDoc,
  TaskPriority,
  WorkspaceDoc,
} from "@/types/domain";
import { apiClient } from "./client";

type ListParams = { page?: number; limit?: number; search?: string };
type WorkspaceRef = { workspaceId: string };
type ProjectRef = WorkspaceRef & { projectId: string };
type BoardRef = ProjectRef & { boardId: string };
type TaskRef = BoardRef & { taskId: string };

const unwrap = <T>(response: { data: ApiSuccessResponse<T> }) =>
  response.data.data;

export const workflowApi = {
  async previewWorkspaceInvitation(token: string) {
    return unwrap(await apiClient.get("/workspaces/invitations/preview", { params: { token } }));
  },
  async acceptWorkspaceInvitation(token: string) {
    return unwrap(await apiClient.post("/workspaces/invitations/accept", { token }));
  },
  async previewProjectInvitation(token: string) {
    return unwrap(await apiClient.get("/projects/invitations/preview", { params: { token } }));
  },
  async acceptProjectInvitation(token: string) {
    return unwrap(await apiClient.post("/projects/invitations/accept", { token }));
  },
  async listWorkspaces(params: ListParams = {}) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<ListResult<WorkspaceDoc, "workspaces">>>("/workspaces", {
        params,
      }),
    );
  },
  async getWorkspace(workspaceId: string) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<{ workspace: WorkspaceDoc }>>(
        `/workspaces/${workspaceId}`,
      ),
    ).workspace;
  },
  async createWorkspace(input: {
    name: string;
    slug?: string;
    description?: string;
    visibility?: WorkspaceDoc["visibility"];
  }) {
    return unwrap(
      await apiClient.post<ApiSuccessResponse<{ workspace: WorkspaceDoc }>>(
        "/workspaces",
        input,
      ),
    ).workspace;
  },
  async updateWorkspace(workspaceId: string, input: Partial<Pick<WorkspaceDoc, "name" | "slug" | "description" | "visibility" | "status">>) {
    return unwrap(
      await apiClient.patch<ApiSuccessResponse<{ workspace: WorkspaceDoc }>>(
        `/workspaces/${workspaceId}`,
        input,
      ),
    ).workspace;
  },
  async deleteWorkspace(workspaceId: string) {
    await apiClient.delete(`/workspaces/${workspaceId}`);
  },

  async listProjects({ workspaceId, ...params }: WorkspaceRef & ListParams) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<ListResult<ProjectDoc, "projects">>>(
        `/workspaces/${workspaceId}/projects`,
        { params },
      ),
    );
  },
  async getProject({ workspaceId, projectId }: ProjectRef) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<{ project: ProjectDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}`,
      ),
    ).project;
  },
  async createProject({ workspaceId, ...input }: WorkspaceRef & {
    name: string; description?: string; icon?: string | null; status?: ProjectStatus;
    startDate?: string | null; endDate?: string | null;
  }) {
    return unwrap(
      await apiClient.post<ApiSuccessResponse<{ project: ProjectDoc }>>(
        `/workspaces/${workspaceId}/projects`,
        input,
      ),
    ).project;
  },
  async updateProject({ workspaceId, projectId, ...input }: ProjectRef & Partial<Pick<ProjectDoc, "name" | "description" | "icon" | "status" | "startDate" | "endDate">>) {
    return unwrap(
      await apiClient.patch<ApiSuccessResponse<{ project: ProjectDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}`,
        input,
      ),
    ).project;
  },
  async deleteProject({ workspaceId, projectId }: ProjectRef) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  },

  async listBoards({ workspaceId, projectId, ...params }: ProjectRef & ListParams) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<ListResult<BoardDoc, "boards">>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards`,
        { params },
      ),
    );
  },
  async getBoard({ workspaceId, projectId, boardId }: BoardRef) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<{ board: BoardDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
      ),
    ).board;
  },
  async createBoard({ workspaceId, projectId, ...input }: ProjectRef & { name: string; description?: string }) {
    return unwrap(
      await apiClient.post<ApiSuccessResponse<{ board: BoardDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards`,
        input,
      ),
    ).board;
  },
  async updateBoard({ workspaceId, projectId, boardId, ...input }: BoardRef & Partial<Pick<BoardDoc, "name" | "description">>) {
    return unwrap(
      await apiClient.patch<ApiSuccessResponse<{ board: BoardDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
        input,
      ),
    ).board;
  },
  async deleteBoard({ workspaceId, projectId, boardId }: BoardRef) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`);
  },

  async listColumns({ workspaceId, projectId, boardId }: BoardRef) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<{ columns: ColumnDoc[] }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns`,
      ),
    ).columns;
  },
  async createColumn({ workspaceId, projectId, boardId, ...input }: BoardRef & { name: string; position: number; color?: string | null; isCompletedColumn?: boolean }) {
    return unwrap(
      await apiClient.post<ApiSuccessResponse<{ column: ColumnDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns`,
        input,
      ),
    ).column;
  },
  async updateColumn({ workspaceId, projectId, boardId, columnId, ...input }: BoardRef & { columnId: string } & Partial<Pick<ColumnDoc, "name" | "position" | "color" | "isCompletedColumn">>) {
    return unwrap(
      await apiClient.patch<ApiSuccessResponse<{ column: ColumnDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
        input,
      ),
    ).column;
  },
  async deleteColumn({ workspaceId, projectId, boardId, columnId }: BoardRef & { columnId: string }) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns/${columnId}`);
  },

  async listTasks({ workspaceId, projectId, boardId, ...params }: BoardRef & ListParams) {
    return unwrap(
      await apiClient.get<ApiSuccessResponse<ListResult<TaskDoc, "tasks">>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks`,
        { params: { limit: 100, ...params } },
      ),
    );
  },
  async createTask({ workspaceId, projectId, boardId, ...input }: BoardRef & {
    title: string; columnId: string; description?: string; priority?: TaskPriority;
    assignees?: string[]; reporterId?: string; dueDate?: string | null; labels?: string[];
  }) {
    return unwrap(
      await apiClient.post<ApiSuccessResponse<{ task: TaskDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks`,
        input,
      ),
    ).task;
  },
  async updateTask({ workspaceId, projectId, boardId, taskId, ...input }: TaskRef &
    Partial<Omit<Pick<TaskDoc, "title" | "columnId" | "position" | "description" | "priority" | "reporterId" | "dueDate" | "labels" | "completedAt">, "reporterId">> & {
      assignees?: string[];
      reporterId?: string;
    }) {
    return unwrap(
      await apiClient.patch<ApiSuccessResponse<{ task: TaskDoc }>>(
        `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}`,
        input,
      ),
    ).task;
  },
  async deleteTask({ workspaceId, projectId, boardId, taskId }: TaskRef) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}`);
  },

  async listWorkspaceMembers({ workspaceId, ...params }: WorkspaceRef & ListParams) {
    return unwrap(await apiClient.get<ApiSuccessResponse<ListResult<MemberDoc, "members">>>(`/workspaces/${workspaceId}/members`, { params }));
  },
  async inviteWorkspaceMember({ workspaceId, email, role }: WorkspaceRef & { email: string; role?: MemberRole }) {
    return unwrap(await apiClient.post(`/workspaces/${workspaceId}/members`, { email, role }));
  },
  async updateWorkspaceMember({ workspaceId, memberId, role }: WorkspaceRef & { memberId: string; role: MemberRole }) {
    return unwrap(await apiClient.patch(`/workspaces/${workspaceId}/members/${memberId}`, { role }));
  },
  async deleteWorkspaceMember({ workspaceId, memberId }: WorkspaceRef & { memberId: string }) {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  async listProjectMembers({ workspaceId, projectId, ...params }: ProjectRef & ListParams) {
    return unwrap(await apiClient.get<ApiSuccessResponse<ListResult<MemberDoc, "members">>>(`/workspaces/${workspaceId}/projects/${projectId}/members`, { params }));
  },
  async inviteProjectMember({ workspaceId, projectId, email, role }: ProjectRef & { email: string; role?: MemberRole }) {
    return unwrap(await apiClient.post(`/workspaces/${workspaceId}/projects/${projectId}/members`, { email, role }));
  },
  async updateProjectMember({ workspaceId, projectId, memberId, role }: ProjectRef & { memberId: string; role: MemberRole }) {
    return unwrap(await apiClient.patch(`/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`, { role }));
  },
  async deleteProjectMember({ workspaceId, projectId, memberId }: ProjectRef & { memberId: string }) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`);
  },

  async listComments({ workspaceId, projectId, boardId, taskId, ...params }: TaskRef & ListParams) {
    return unwrap(await apiClient.get<ApiSuccessResponse<ListResult<TaskCommentDoc, "comments">>>(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}/comments`, { params }));
  },
  async createComment({ workspaceId, projectId, boardId, taskId, content }: TaskRef & { content: string }) {
    return unwrap(await apiClient.post<ApiSuccessResponse<{ comment: TaskCommentDoc }>>(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}/comments`, { content })).comment;
  },
  async updateComment({ workspaceId, projectId, boardId, taskId, commentId, content }: TaskRef & { commentId: string; content: string }) {
    return unwrap(await apiClient.patch<ApiSuccessResponse<{ comment: TaskCommentDoc }>>(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}/comments/${commentId}`, { content })).comment;
  },
  async deleteComment({ workspaceId, projectId, boardId, taskId, commentId }: TaskRef & { commentId: string }) {
    await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/tasks/${taskId}/comments/${commentId}`);
  },
};
