"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
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
import { useMemo, useState } from "react";
import { LiveKanbanBoard } from "@/components/app/board/live-kanban-board";
import { appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { canManageWorkspaceContent } from "@/lib/workspace-permissions";
import { useWorkspaceBySlug } from "@/hooks/use-workflow";
import type {
  Board,
  BoardColumn,
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  Workspace,
} from "@/types/workspace";

// ─── Config ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<
  TaskPriority,
  { icon: React.ElementType; label: string; className: string }
> = {
  high: { icon: ArrowUp, label: "High", className: "text-destructive" },
  medium: { icon: ArrowRight, label: "Medium", className: "text-chart-4" },
  low: { icon: ArrowDown, label: "Low", className: "text-muted-foreground" },
};

const statusDotColors: Record<TaskStatus, string> = {
  backlog: "bg-muted-foreground/50",
  in_progress: "bg-primary",
  review: "bg-chart-4",
  done: "bg-chart-2",
};

const columnBgColors: Record<TaskStatus, string> = {
  backlog: "bg-muted/60",
  in_progress: "bg-primary/[0.06]",
  review: "bg-chart-4/[0.06]",
  done: "bg-chart-2/[0.06]",
};

// ─── PriorityIcon ─────────────────────────────────────────────────────────────

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  const { icon: Icon, label, className } = priorityConfig[priority];
  return (
    <Icon className={cn("size-3.5 shrink-0", className)} aria-label={label} />
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  isDragging = false,
}: {
  task: Task;
  isDragging?: boolean;
}) {
  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-3 shadow-sm transition-all",
        isDragging
          ? "opacity-40 shadow-none"
          : "hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg",
      )}
    >
      <p className="text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
        {task.title}
      </p>
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

// ─── SortableTaskCard ─────────────────────────────────────────────────────────

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

function KanbanColumn({ column }: { column: BoardColumn }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = useMemo(() => column.tasks.map((t) => t.id), [column.tasks]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-2xl gap-3 p-3 transition-colors duration-150",
        columnBgColors[column.status],
        isOver && "ring-2 ring-primary/30 ring-inset",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span
          className={cn(
            "size-2 shrink-0 rounded-full",
            statusDotColors[column.status],
          )}
        />
        <span className="text-sm font-semibold text-foreground">
          {column.title}
        </span>
        <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground shadow-sm">
          {column.tasks.length}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
            aria-label="Column options"
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Task list */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}

          {column.tasks.length === 0 && (
            <div
              className={cn(
                "flex h-20 items-center justify-center rounded-xl border-2 border-dashed text-xs text-muted-foreground transition-colors",
                isOver ? "border-primary/50 text-primary" : "border-border/50",
              )}
            >
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add task button */}
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add task
      </button>
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

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
        className="transition-colors hover:text-foreground"
      >
        Workspaces
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.workspace(workspace.slug)}
        className="transition-colors hover:text-foreground"
      >
        {workspace.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.project(workspace.slug, project.id)}
        className="transition-colors hover:text-foreground"
      >
        {project.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="font-medium text-foreground">{board.name}</span>
    </nav>
  );
}

// ─── BoardPage ────────────────────────────────────────────────────────────────

type MockBoardPageProps = {
  workspace: Workspace;
  project: Project;
  board: Board;
};

type BoardPageProps =
  | MockBoardPageProps
  | { workspaceSlug: string; projectId: string; boardId: string };

function ConnectedBoardPage({
  workspaceSlug,
  projectId,
  boardId,
}: {
  workspaceSlug: string;
  projectId: string;
  boardId: string;
}) {
  const { workspace, isLoading: isWorkspaceLoading } =
    useWorkspaceBySlug(workspaceSlug);

  if (isWorkspaceLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading board…</div>
    );
  }
  if (!workspace) {
    return (
      <div className="p-8 text-sm text-destructive">
        Board not found or you do not have access.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <LiveKanbanBoard
        workspaceId={workspace._id}
        projectId={projectId}
        boardId={boardId}
        boardName="Board"
        canManageColumns={canManageWorkspaceContent(workspace.membershipRole)}
      />
    </div>
  );
}

export function BoardPage(props: BoardPageProps) {
  if ("workspaceSlug" in props) return <ConnectedBoardPage {...props} />;
  const { workspace, project, board } = props;
  const [columns, setColumns] = useState<BoardColumn[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  function findColumnByTaskId(taskId: string): BoardColumn | undefined {
    return columns.find((col) => col.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart({ active }: DragStartEvent) {
    const col = findColumnByTaskId(active.id as string);
    setActiveTask(col?.tasks.find((t) => t.id === active.id) ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCol = findColumnByTaskId(activeId);
    // `over` can be a task id or a column id (from useDroppable)
    const overCol =
      findColumnByTaskId(overId) ?? columns.find((c) => c.id === overId);

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    // Move task to the new column
    setColumns((prev) => {
      const task = activeCol.tasks.find((t) => t.id === activeId)!;
      const overTaskIndex = overCol.tasks.findIndex((t) => t.id === overId);

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const updated = [...col.tasks];
          const insertAt = overTaskIndex >= 0 ? overTaskIndex : updated.length;
          updated.splice(insertAt, 0, { ...task, status: col.status });
          return { ...col, tasks: updated };
        }
        return col;
      });
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Only handle within-column reordering — cross-column already done in dragOver
    const activeCol = findColumnByTaskId(activeId);
    const overCol = findColumnByTaskId(overId);
    if (!activeCol || !overCol || activeCol.id !== overCol.id) return;

    const oldIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
    const newIndex = activeCol.tasks.findIndex((t) => t.id === overId);

    if (oldIndex !== newIndex) {
      setColumns((prev) =>
        prev.map((col) =>
          col.id === activeCol.id
            ? { ...col, tasks: arrayMove(col.tasks, oldIndex, newIndex) }
            : col,
        ),
      );
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  return (
    <div className="flex h-full flex-col">
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
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
            >
              Filter
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="size-3.5" />
              Add task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban area — scrolls horizontally; scrollbar is invisible */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="scrollbar-hidden flex-1 overflow-x-auto">
          <div
            className="flex h-full items-start gap-4 px-4 py-4 sm:px-6"
            style={{ minWidth: "max-content" }}
          >
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}

            {/* Add column */}
            <div className="w-72 shrink-0 pt-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-primary dark:hover:bg-emerald-400/10"
              >
                <Plus className="size-4" />
                Add column
              </button>
            </div>
          </div>
        </div>

        {/* Floating ghost card while dragging */}
        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeTask && (
            <div className="w-72 rotate-1 opacity-95 shadow-2xl">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
