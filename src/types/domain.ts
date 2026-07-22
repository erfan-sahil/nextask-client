export type Id = string;

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type GoalStatus =
  "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type GoalPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ApiUser = {
  _id: Id;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string | null;
};

export type WorkspaceDoc = {
  _id: Id;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  visibility: "PRIVATE" | "TEAM" | "PUBLIC";
  status: "ACTIVE" | "ARCHIVED";
  memberCount: number;
  projectCount: number;
  taskCount: number;
  membershipRole: MemberRole | null;
  joinedAt: string | null;
};

export type ProjectDoc = {
  _id: Id;
  workspaceId: Id | Pick<WorkspaceDoc, "_id" | "name" | "slug">;
  name: string;
  description: string;
  icon: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  taskCount: number;
  createdBy: ApiUser;
  updatedBy: ApiUser;
};

export type BoardDoc = {
  _id: Id;
  workspaceId: Id;
  projectId: Id;
  name: string;
  description: string;
  createdBy: ApiUser;
  updatedBy: ApiUser;
};

export type ColumnDoc = {
  _id: Id;
  boardId: Id;
  name: string;
  position: number;
  color: string | null;
  isCompletedColumn: boolean;
  createdBy: ApiUser;
};

export type TaskDoc = {
  _id: Id;
  workspaceId: Id;
  projectId: Id;
  boardId: Id;
  columnId:
    | Id
    | Pick<
        ColumnDoc,
        "_id" | "name" | "position" | "color" | "isCompletedColumn"
      >;
  position: number;
  title: string;
  description: string;
  priority: TaskPriority;
  assignees: ApiUser[];
  reporterId: ApiUser;
  dueDate: string | null;
  labels: string[];
  completedAt: string | null;
  commentCount?: number;
  createdBy: ApiUser;
  updatedBy: ApiUser;
};

export type MemberDoc = {
  _id: Id;
  workspaceId: Id;
  projectId?: Id;
  userId: ApiUser;
  role: MemberRole;
  invitedBy: ApiUser | null;
  joinedAt: string;
};

export type TaskCommentDoc = {
  _id: Id;
  taskId: Id;
  content: string;
  createdBy: ApiUser;
  updatedBy: ApiUser;
  createdAt: string;
  updatedAt: string;
};

export type GoalDoc = {
  _id: Id;
  workspaceId: Id | Pick<WorkspaceDoc, "_id" | "name" | "slug">;
  title: string;
  description: string;
  status: GoalStatus;
  startDate: string | null;
  dueDate: string | null;
  priority: GoalPriority;
  createdBy: ApiUser;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventType = "task-deadline" | "goal-deadline" | "meeting";

export type CalendarEventDoc = {
  id: string;
  resourceId: Id;
  type: CalendarEventType;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  projectId?: Id;
  location?: string;
  attendeeIds?: Id[];
  createdBy?: Id;
};

export type MeetingDoc = {
  _id: Id;
  workspaceId: Id;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  attendees: Id[];
  createdBy: Id;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListResult<T, K extends string> = {
  [P in K]: T[];
} & { pagination: PaginationMeta };
