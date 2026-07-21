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
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
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
};

type TaskModalState =
  | { mode: "create"; columnId: string }
  | { mode: "details" | "edit" | "delete"; task: TaskDoc }
  | null;

type ColumnModalState =
  | { mode: "create" }
  | { mode: "edit" | "delete"; column: ColumnDoc }
  | null;

const priorityClass = {
  LOW: "text-muted-foreground",
  MEDIUM: "text-chart-4",
  HIGH: "text-orange-500",
  URGENT: "text-destructive",
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
        "group w-full rounded-xl border border-border bg-card p-3 text-left shadow-sm transition-all",
        isDragging
          ? "opacity-40 shadow-none"
          : "hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onClick}
          className="min-w-0 flex-1 cursor-pointer text-left"
          aria-label={`View details for ${task.title}`}
        >
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{task.title}</p>
        </button>
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onPointerDown={(event) => event.stopPropagation()}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Options for ${task.title}`}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={onClick} className="gap-2">
                <Eye className="size-3.5" />
                View details
              </DropdownMenuItem>
              {(onEdit || onDelete) && <DropdownMenuSeparator />}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Pencil className="size-3.5" />
                  Edit task
                </DropdownMenuItem>
              )}
              {onEdit && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="mt-2.5 w-full cursor-pointer text-left"
        aria-label={`View details for ${task.title}`}
      >
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide", priorityClass[task.priority])}>
            {task.priority[0]}{task.priority.slice(1).toLowerCase()}
          </span>
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
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3" />
            {task.commentCount ?? 0}
          </span>
          {task.assignees.length > 0 && (
            <span className="ml-auto flex -space-x-1.5">
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
                <span className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[0.6rem] font-semibold text-muted-foreground">
                  +{task.assignees.length - 3}
                </span>
              )}
            </span>
          )}
        </div>
      </button>
      {(onMoveUp || onMoveDown) && (
        <div className="mt-2 flex justify-end gap-1 border-t border-border pt-2">
          <button
            type="button"
            onClick={onMoveUp}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={!canMoveUp}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Move ${task.title} up`}
          >
            <ChevronUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            onPointerDown={(event) => event.stopPropagation()}
            disabled={!canMoveDown}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label={`Move ${task.title} down`}
          >
            <ChevronDown className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  task: TaskDoc;
  onClick: () => void;
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
  onEditTask,
  onDeleteTask,
  onMoveTask,
}: {
  column: ColumnDoc;
  tasks: TaskDoc[];
  onCreateTask: () => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
  onOpenTask: (task: TaskDoc) => void;
  onEditTask: (task: TaskDoc) => void;
  onDeleteTask: (task: TaskDoc) => void;
  onMoveTask: (task: TaskDoc, position: number) => void;
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
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label={`Add task to ${column.name}`}
          >
            <Plus className="size-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label={`Options for ${column.name}`}
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEditColumn} className="gap-2">
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeleteColumn}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-20 flex-col gap-2">
          {tasks.map((task, index) => (
            <SortableTaskCard
              key={task._id}
              task={task}
              onClick={() => onOpenTask(task)}
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
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
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
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold">{boardName}</h1>
          <p className="text-xs text-muted-foreground">
            {kanban.tasks.data?.pagination.total ?? 0} tasks
          </p>
        </div>
        <button
          type="button"
          onClick={() => setColumnModal({ mode: "create" })}
          className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="mr-1 inline size-3.5" />
          Add column
        </button>
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
                onEditTask={(task) => setTaskModal({ mode: "edit", task })}
                onDeleteTask={(task) => setTaskModal({ mode: "delete", task })}
                onMoveTask={moveTask}
              />
            ))}
            <button
              type="button"
              onClick={() => setColumnModal({ mode: "create" })}
              className="w-72 shrink-0 rounded-2xl border-2 border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground hover:border-primary/50 hover:text-primary"
            >
              <Plus className="mr-2 inline size-4" />
              Add column
            </button>
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
      {columnModal && (
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
