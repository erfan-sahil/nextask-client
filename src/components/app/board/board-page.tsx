"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  ChevronRight,
  MessageSquare,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type {
  Board,
  BoardColumn,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  Workspace,
} from "@/types/workspace";

const priorityConfig: Record<
  TaskPriority,
  { icon: React.ElementType; label: string; className: string }
> = {
  high: {
    icon: ArrowUp,
    label: "High",
    className: "text-destructive",
  },
  medium: {
    icon: ArrowRight,
    label: "Medium",
    className: "text-chart-4",
  },
  low: {
    icon: ArrowDown,
    label: "Low",
    className: "text-muted-foreground",
  },
};

const statusColors: Record<TaskStatus, string> = {
  backlog: "bg-muted-foreground/30",
  in_progress: "bg-primary",
  review: "bg-chart-4",
  done: "bg-chart-2",
};

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <Icon
      className={cn("size-3.5", config.className)}
      aria-label={config.label}
    />
  );
}

function TaskCard({ task }: { task: Task }) {
  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="group rounded-xl border border-border bg-background p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer">
      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug">
        {task.title}
      </p>

      {/* Meta row */}
      <div className="mt-2.5 flex items-center gap-2">
        <PriorityIcon priority={task.priority} />

        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Calendar className="size-3" />
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="size-3" />
              {task.commentCount}
            </span>
          )}
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[0.6rem] font-bold text-primary">
            {task.assigneeInitials}
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column }: { column: BoardColumn }) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <span
          className={cn("size-2 rounded-full", statusColors[column.status])}
        />
        <span className="text-sm font-semibold text-foreground">
          {column.title}
        </span>
        <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {column.tasks.length}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Column options"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-2">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {column.tasks.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
            No tasks
          </div>
        )}
      </div>

      {/* Add task button */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add task
      </button>
    </div>
  );
}

function Breadcrumb({
  workspace,
  project,
  board,
}: {
  workspace: Workspace;
  project: Project;
  board: Board;
}) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        href={appRoutes.workspaces}
        className="hover:text-foreground transition-colors"
      >
        Workspaces
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.workspace(workspace.slug)}
        className="hover:text-foreground transition-colors"
      >
        {workspace.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.project(workspace.slug, project.id)}
        className="hover:text-foreground transition-colors"
      >
        {project.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="font-medium text-foreground">{board.name}</span>
    </nav>
  );
}

type BoardPageProps = {
  workspace: Workspace;
  project: Project;
  board: Board;
};

export function BoardPage({ workspace, project, board }: BoardPageProps) {
  const totalTasks = board.columns.reduce(
    (acc, col) => acc + col.tasks.length,
    0,
  );

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-4 sm:px-6">
        <Breadcrumb workspace={workspace} project={project} board={board} />
        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{board.name}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalTasks} tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Add task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban scroll area */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 py-4 sm:px-6" style={{ minWidth: "max-content" }}>
          {board.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}

          {/* Add column */}
          <div className="flex w-72 shrink-0 items-start">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Plus className="size-4" />
              Add column
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
