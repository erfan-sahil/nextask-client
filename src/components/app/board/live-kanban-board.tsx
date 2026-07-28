"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ColumnModal } from "@/components/app/board/column-modal";
import { TaskModal } from "@/components/app/board/task-modal";
import { UserAvatar } from "@/components/app/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useKanban } from "@/hooks/use-workflow";
import { cn } from "@/lib/utils";
import type { ColumnDoc, TaskDoc } from "@/types/domain";

type LiveKanbanBoardProps = {
  workspaceId: string;
  projectId: string;
  boardId: string;
  boardName: string;
  canManageColumns: boolean;
};

type TaskModalState =
  | { mode: "create"; columnId: string }
  | { mode: "assign" | "details" | "edit" | "delete"; task: TaskDoc }
  | null;

type ColumnModalState =
  | { mode: "create" }
  | { mode: "edit" | "delete"; column: ColumnDoc }
  | null;

const priorityClass = {
  LOW: "border-lime-500/20 bg-lime-500/10 text-lime-700 dark:text-lime-400",
  MEDIUM: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  HIGH: "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  URGENT: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
} as const;

function taskColumnId(task: TaskDoc) {
  const columnId = task.columnId as unknown;
  return typeof columnId === "string"
    ? columnId
    : (columnId as { _id: string })._id;
}

function TaskCard({
  task,
  isDragging = false,
  onClick,
  onAssign,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: {
  task: TaskDoc;
  isDragging?: boolean;
  onClick?: () => void;
  onAssign?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const isOverdue =
    task.dueDate &&
    !task.completedAt &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      className={cn(
        "group w-full rounded-xl border border-border bg-card p-3 text-left transition-colors",
        onClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragging
          ? "opacity-40"
          : "hover:border-primary/35 hover:bg-primary/1 dark:hover:border-primary/30 dark:hover:bg-muted/40",
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {task.title}
          </p>
        </div>
        {(onAssign || onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Options for ${task.title}`}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onClick?.();
                }}
                onPointerDown={(event) => event.stopPropagation()}
                className="cursor-pointer gap-2"
              >
                <Eye className="size-3.5" />
                View details
              </DropdownMenuItem>
              {(onAssign || onEdit || onDelete) && <DropdownMenuSeparator />}
              {onAssign && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onAssign();
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="cursor-pointer gap-2"
                >
                  <Users className="size-3.5" />
                  Assign Member
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="cursor-pointer gap-2"
                >
                  <Pencil className="size-3.5" />
                  Edit task
                </DropdownMenuItem>
              )}
              {(onAssign || onEdit) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="mt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide",
              priorityClass[task.priority],
            )}
          >
            {task.priority[0]}{task.priority.slice(1).toLowerCase()}
          </span>
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs tabular-nums",
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
          <span className="flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/10 px-1.5 py-1 text-[0.7rem] font-semibold tabular-nums text-violet-700 transition-colors group-hover:bg-violet-500/15 dark:text-violet-300">
            <MessageSquare className="size-3" />
            {task.commentCount ?? 0}
          </span>
          {task.assignees.length > 0 && (
            <span className="ml-auto flex items-center rounded-full border border-border/70 bg-background p-0.5 transition-colors group-hover:bg-card">
              <span className="sr-only">Assigned to </span>
              <span className="flex -space-x-1.5">
                {task.assignees.slice(0, 3).map((assignee) => (
                  <UserAvatar
                    key={assignee._id}
                    name={`${assignee.firstName} ${assignee.lastName}`}
                    avatar={assignee.avatar}
                    title={`${assignee.firstName} ${assignee.lastName}`}
                    size="sm"
                    className="size-6 border-2 border-card text-[0.6rem]"
                  />
                ))}
                {task.assignees.length > 3 && (
                  <span className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[0.6rem] font-semibold text-muted-foreground group-hover:border-card">
                    +{task.assignees.length - 3}
                  </span>
                )}
              </span>
            </span>
          )}
        </div>
      </div>
      {(onMoveUp || onMoveDown) && (
        <div className="mt-2 flex justify-end gap-1 border-t border-border pt-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp?.();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={!canMoveUp}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-transparent bg-background text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Move ${task.title} up`}
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown?.();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={!canMoveDown}
            className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-transparent bg-background text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Move ${task.title} down`}
          >
            <ArrowDown className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  onClick,
  onAssign,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  task: TaskDoc;
  onClick: () => void;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        isDragging={isDragging}
        onClick={onClick}
        onAssign={onAssign}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onCreateTask,
  onEditColumn,
  onDeleteColumn,
  onOpenTask,
  onAssignTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  canManageColumns,
}: {
  column: ColumnDoc;
  tasks: TaskDoc[];
  onCreateTask: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onOpenTask: (task: TaskDoc) => void;
  onAssignTask: (task: TaskDoc) => void;
  onEditTask: (task: TaskDoc) => void;
  onDeleteTask: (task: TaskDoc) => void;
  onMoveTask: (task: TaskDoc, position: number) => void;
  canManageColumns: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column._id });
  const taskIds = useMemo(() => tasks.map((task) => task._id), [tasks]);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-3 rounded-2xl bg-muted/60 p-3 transition-colors",
        isOver && "ring-2 ring-primary/30 ring-inset",
      )}
    >
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: column.color ?? "#64748b" }}
        />
        <span className="truncate text-sm font-semibold text-foreground">{column.name}</span>
        <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs text-muted-foreground">
          {tasks.length}
        </span>
        <div className="ml-auto flex items-center">
          <button
            type="button"
            onClick={onCreateTask}
            className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label={`Add task to ${column.name}`}
          >
            <Plus className="size-3.5" />
          </button>
          {canManageColumns && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label={`Options for ${column.name}`}
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onEditColumn} className="cursor-pointer gap-2">
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteColumn}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-20 flex-col gap-2">
          {tasks.map((task, index) => (
            <SortableTaskCard
              key={task._id}
              task={task}
              onClick={() => onOpenTask(task)}
              onAssign={() => onAssignTask(task)}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
              onMoveUp={() => onMoveTask(task, index - 1)}
              onMoveDown={() => onMoveTask(task, index + 1)}
              canMoveUp={index > 0}
              canMoveDown={index < tasks.length - 1}
            />
          ))}
          {!tasks.length && (
            <div className="flex h-20 items-center justify-center rounded-xl border-2 border-dashed border-border/50 text-xs text-muted-foreground">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={onCreateTask}
        className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <Plus className="size-3.5" />
        Add task
      </button>
    </section>
  );
}

export function LiveKanbanBoard({
  workspaceId,
  projectId,
  boardId,
  boardName,
  canManageColumns,
}: LiveKanbanBoardProps) {
  const kanban = useKanban(workspaceId, projectId, boardId);
  const [activeTask, setActiveTask] = useState<TaskDoc | null>(null);
  const [taskModal, setTaskModal] = useState<TaskModalState>(null);
  const [columnModal, setColumnModal] = useState<ColumnModalState>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const columns = [...(kanban.columns.data ?? [])].sort(
    (first, second) => first.position - second.position,
  );
  const tasks = kanban.tasks.data?.tasks ?? [];
  const tasksByColumn = new Map(
    columns.map((column) => [
      column._id,
      tasks
        .filter((task) => taskColumnId(task) === column._id)
        .sort((first, second) => first.position - second.position),
    ]),
  );

  function moveTask(task: TaskDoc, position: number) {
    kanban.updateTask.mutate({
      workspaceId,
      projectId,
      boardId,
      taskId: task._id,
      position,
    });
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((item) => item._id === active.id);
    if (!task) return;

    const targetColumnId = columns.some((column) => column._id === over.id)
      ? String(over.id)
      : taskColumnId(tasks.find((item) => item._id === over.id) ?? task);

    const targetTasks = tasksByColumn.get(targetColumnId) ?? [];
    const targetPosition = targetTasks.findIndex(
      (item) => item._id === over.id,
    );

    if (
      targetColumnId === taskColumnId(task) &&
      (targetPosition < 0 || targetPosition === task.position)
    ) {
      return;
    }

    kanban.updateTask.mutate({
      workspaceId,
      projectId,
      boardId,
      taskId: task._id,
      columnId: targetColumnId,
      position: targetPosition < 0 ? targetTasks.length : targetPosition,
    });
  }

  if (kanban.columns.isLoading || kanban.tasks.isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading board…</p>;
  }

  return (
    <>
      <div className="border-b border-border bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/75 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Project board</p>
            <div className="flex items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{boardName}</h1>
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary">
                {kanban.tasks.data?.pagination.total ?? 0} total tasks
              </span>
            </div>
          </div>
          {canManageColumns && (
            <button
              type="button"
              onClick={() => setColumnModal({ mode: "create" })}
              className="shrink-0 cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="mr-1 inline size-3.5" />
              Add column
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) =>
          setActiveTask(tasks.find((task) => task._id === active.id) ?? null)
        }
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="scrollbar-hidden flex-1 overflow-x-auto">
          <div className="flex h-full items-start gap-4 p-4 sm:p-6" style={{ minWidth: "max-content" }}>
            {columns.map((column) => (
              <KanbanColumn
                key={column._id}
                column={column}
                tasks={tasksByColumn.get(column._id) ?? []}
                onCreateTask={() => setTaskModal({ mode: "create", columnId: column._id })}
                onEditColumn={() => setColumnModal({ mode: "edit", column })}
                onDeleteColumn={() => setColumnModal({ mode: "delete", column })}
                onOpenTask={(task) => setTaskModal({ mode: "details", task })}
                onAssignTask={(task) => setTaskModal({ mode: "assign", task })}
                onEditTask={(task) => setTaskModal({ mode: "edit", task })}
                onDeleteTask={(task) => setTaskModal({ mode: "delete", task })}
                onMoveTask={moveTask}
                canManageColumns={canManageColumns}
              />
            ))}
            {canManageColumns && (
              <button
                type="button"
                onClick={() => setColumnModal({ mode: "create" })}
                className="w-72 shrink-0 cursor-pointer rounded-2xl border-2 border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Plus className="mr-2 inline size-4" />
                Add column
              </button>
            )}
          </div>
        </div>
        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeTask && <div className="w-72 rotate-1"><TaskCard task={activeTask} /></div>}
        </DragOverlay>
      </DndContext>

      {taskModal && (
        <TaskModal
          key={taskModal.mode === "create" ? `create-${taskModal.columnId}` : `${taskModal.mode}-${taskModal.task._id}`}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setTaskModal(null)}
          workspaceId={workspaceId}
          projectId={projectId}
          boardId={boardId}
          columns={columns}
          mode={taskModal.mode}
          task={taskModal.mode === "create" ? undefined : taskModal.task}
          initialColumnId={taskModal.mode === "create" ? taskModal.columnId : undefined}
        />
      )}
      {canManageColumns && columnModal && (
        <ColumnModal
          key={columnModal.mode === "create" ? "create" : `${columnModal.mode}-${columnModal.column._id}`}
          isOpen
          onOpenChange={(isOpen) => !isOpen && setColumnModal(null)}
          workspaceId={workspaceId}
          projectId={projectId}
          boardId={boardId}
          nextPosition={columns.length}
          mode={columnModal.mode}
          column={columnModal.mode === "create" ? undefined : columnModal.column}
        />
      )}
    </>
  );
}
