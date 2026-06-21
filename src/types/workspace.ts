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
  projectName: string;
  workspaceName: string;
  columns: BoardColumn[];
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
