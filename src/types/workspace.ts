export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "backlog" | "in_progress" | "review" | "done";

export type Comment = {
  id: string;
  authorName: string;
  authorInitials: string;
  taskTitle: string;
  projectName: string;
  content: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeInitials: string;
  dueDate: string | null;
  commentCount: number;
};

export type BoardColumn = {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
};

export type Board = {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  workspaceName: string;
  description?: string;
  columns: BoardColumn[];
};

export type BoardMeta = Omit<Board, "columns"> & {
  taskCount: number;
};

export type Project = {
  id: string;
  name: string;
  workspaceId: string;
  description: string;
  taskCount: number;
  completedTaskCount: number;
  memberCount: number;
  dueDate: string | null;
  color: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  projectCount: number;
  color: string;
  initials: string;
};

export type ActivityItem = {
  id: string;
  type: "task" | "comment" | "project" | "board";
  userName: string;
  userInitials: string;
  action: string;
  target: string;
  context: string;
  createdAt: string;
};

export type DashboardStats = {
  activeProjects: number;
  openTasks: number;
  dueThisWeek: number;
  teamMembers: number;
};

export type DashboardTask = {
  _id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  completedAt: string | null;
  status: {
    name: string;
    isCompleted: boolean;
  } | null;
  workspace: {
    _id: string;
    name: string;
    slug: string;
  };
  project: {
    _id: string;
    name: string;
  };
  board: {
    _id: string;
    name: string;
  };
};

export type DashboardActivity = {
  _id: string;
  type:
    | "TASK_ASSIGNED"
    | "TASK_UPDATED"
    | "TASK_COMMENT"
    | "MENTION"
    | "CHAT_MENTION"
    | "MEETING_CREATED"
    | "MEETING_UPDATED";
  message: string;
  createdAt: string;
  readAt: string | null;
  actor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  task: {
    _id: string;
    title: string;
    workspaceId: {
      _id: string;
      slug: string;
    };
    projectId: {
      _id: string;
    };
    boardId: {
      _id: string;
    };
  } | null;
};

export type DashboardMeeting = {
  _id: string;
  title: string;
  startsAt: string;
  location: string;
  workspace: {
    _id: string;
    name: string;
    slug: string;
  };
  attendeeCount: number;
};

export type MemberRole = "owner" | "admin" | "member" | "viewer";

export type Member = {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  initials: string;
  role: MemberRole;
  avatarColor: string;
  joinedAt: string;
  projectIds: string[];
};

export type GoalStatus =
  | "planning"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export type KeyResult = {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
};

export type Goal = {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  status: GoalStatus;
  ownerInitials: string;
  ownerName: string;
  ownerColor: string;
  dueDate: string;
  projectIds: string[];
  keyResults: KeyResult[];
};
