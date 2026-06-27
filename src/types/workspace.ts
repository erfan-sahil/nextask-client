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

export type GoalStatus = "on_track" | "at_risk" | "off_track" | "completed";

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
