"use client";

import {
  AlertTriangle,
  CalendarDays,
  CircleDot,
  Flag,
  ListTodo,
  MessageSquare,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useKanban,
  useProjectMembers,
  useTaskComments,
  useWorkspaceMembers,
} from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import type { ColumnDoc, TaskDoc, TaskPriority } from "@/types/domain";

function getColumnId(columnId: TaskDoc["columnId"]) {
  return typeof columnId === "string" ? columnId : columnId._id;
}

type TaskModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  columns: ColumnDoc[];
  mode: "create" | "details" | "edit" | "delete";
  task?: TaskDoc;
  initialColumnId?: string;
};

export function TaskModal({
  isOpen,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  columns,
  mode,
  task,
  initialColumnId,
}: TaskModalProps) {
  const kanban = useKanban(workspaceId, projectId, boardId);
  const comments = useTaskComments(workspaceId, projectId, boardId, task?._id);
  const workspaceMembers = useWorkspaceMembers(workspaceId);
  const projectMembers = useProjectMembers(workspaceId, projectId);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
  );
  const [calendarMonth, setCalendarMonth] = useState(
    task?.dueDate ? new Date(task.dueDate) : new Date(),
  );
  const [columnId, setColumnId] = useState(
    task ? getColumnId(task.columnId) : initialColumnId ?? columns[0]?._id ?? "",
  );
  const [assigneeIds, setAssigneeIds] = useState(
    task?.assignees.map((assignee) => assignee._id) ?? [],
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);
  const isDeleting = mode === "delete" || isDeleteConfirmation;
  const isDetails = mode === "details";
  const isPending =
    kanban.createTask.isPending ||
    kanban.updateTask.isPending ||
    kanban.deleteTask.isPending;
  const members = useMemo(
    () =>
      Array.from(
        new Map(
          [
            ...(workspaceMembers.data?.members ?? []),
            ...(projectMembers.data?.members ?? []),
          ].map((member) => [member.userId._id, member.userId]),
        ).values(),
      ),
    [projectMembers.data?.members, workspaceMembers.data?.members],
  );
  const filteredMembers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();
    if (!search) return members;

    return members.filter((member) =>
      `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase().includes(search),
    );
  }, [memberSearch, members]);
  const selectedAssignees = useMemo(() => {
    const membersById = new Map(members.map((member) => [member._id, member]));
    const taskAssigneesById = new Map(task?.assignees.map((member) => [member._id, member]));

    return assigneeIds
      .map((memberId) => membersById.get(memberId) ?? taskAssigneesById.get(memberId))
      .filter((member) => member !== undefined)
  }, [assigneeIds, members, task?.assignees]);

  function toggleAssignee(memberId: string) {
    setAssigneeIds((currentAssigneeIds) =>
      currentAssigneeIds.includes(memberId)
        ? currentAssigneeIds.filter((id) => id !== memberId)
        : [...currentAssigneeIds, memberId],
    );
  }

  if (!isOpen) return null;

  function closeModal() {
    if (!isPending) onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      if (isDeleting && task) {
        await kanban.deleteTask.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          taskId: task._id,
        });
      } else if (task) {
        await kanban.updateTask.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          taskId: task._id,
          title: title.trim(),
          description: description.trim(),
          priority,
          columnId,
          assignees: assigneeIds,
          dueDate: dueDate || null,
        });
      } else {
        await kanban.createTask.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          columnId,
          assignees: assigneeIds,
          dueDate: dueDate || undefined,
        });
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function addComment() {
    if (!task || !comment.trim()) return;
    setFormError(null);
    try {
      await comments.create.mutateAsync({
        workspaceId,
        projectId,
        boardId,
        taskId: task._id,
        content: comment.trim(),
      });
      setComment("");
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const heading = isDeleting
    ? "Delete task"
    : isDetails
      ? task?.title ?? "Task details"
      : task
        ? "Edit task"
        : "Create task";
  const selectedDueDate = dueDate ? new Date(`${dueDate}T00:00:00`) : undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className={isDetails ? "max-w-3xl" : isDeleting ? "max-w-md" : undefined}>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className={isDetails || isDeleting ? "relative pr-10" : undefined}>
            <DialogTitle className={!task && !isDeleting ? "text-primary" : undefined}>
              {heading}
            </DialogTitle>
            <DialogDescription>
              {isDeleting
                ? `This will permanently delete ${task?.title}.`
                : isDetails
                  ? "Task details and discussion."
                  : "Add the details needed to complete this work."}
            </DialogDescription>
            {(isDetails || isDeleting) && (
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-0 right-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={isDeleting ? "Close delete task dialog" : "Close task details"}
                disabled={isPending}
              >
                <X className="size-4" />
              </button>
            )}
          </DialogHeader>

        {isDeleting ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Delete “{task?.title}”?
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                This will permanently remove the task and its comments.
              </p>
            </div>
          </div>
        ) : isDetails && task ? (
          <section className="mt-6 space-y-5">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListTodo className="size-3.5" />
                Description
              </div>
              {task.description ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/80">
                  {task.description}
                </p>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-border bg-background/60 px-4 py-4 text-center">
                  <p className="text-sm font-medium text-foreground/80">No description yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This task does not have any additional context.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task info
              </p>
              <dl className="mt-3 grid gap-2.5 sm:grid-cols-3">
                <div className="flex gap-3 rounded-xl bg-muted/50 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm ring-1 ring-border/70">
                    <CircleDot className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Column</dt>
                    <dd className="mt-1 truncate text-sm font-semibold">
                      {columns.find((column) => column._id === getColumnId(task.columnId))?.name ?? "Unknown"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-muted/50 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-orange-500 shadow-sm ring-1 ring-border/70">
                    <Flag className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Priority</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {task.priority[0]}{task.priority.slice(1).toLowerCase()}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl bg-muted/50 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-chart-4 shadow-sm ring-1 ring-border/70">
                    <CalendarDays className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Due date</dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No due date"}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {task.assignees.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="size-4 text-muted-foreground" />
                  Assignees
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.assignees.map((assignee) => (
                    <div
                      key={assignee._id}
                      className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[0.6rem] font-bold text-primary">
                        {`${assignee.firstName[0] ?? ""}${assignee.lastName[0] ?? ""}`}
                      </span>
                      <span className="text-xs font-medium">
                        {assignee.firstName} {assignee.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="task-title">Task title</Label>
              <Input id="task-title" autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Prepare launch brief" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Add more context…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-column">Column</Label>
              <Select
                value={columnId}
                onValueChange={(value) => {
                  if (value) setColumnId(value);
                }}
              >
                <SelectTrigger id="task-column" className="h-10 w-full cursor-pointer rounded-xl bg-background px-3">
                  <SelectValue placeholder="Select a column">
                    {(value: string | null) =>
                      columns.find((column) => column._id === value)?.name ??
                      "Select a column"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {columns.map((column) => (
                    <SelectItem key={column._id} value={column._id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => {
                  if (value) setPriority(value as TaskPriority);
                }}
              >
                <SelectTrigger id="task-priority" className="h-10 w-full cursor-pointer rounded-xl bg-background px-3">
                  <SelectValue>
                    {(value: string | null) =>
                      value ? `${value[0]}${value.slice(1).toLowerCase()}` : "Select priority"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value[0]}{value.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger
                  type="button"
                  className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm font-normal transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Select task deadline"
                >
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className={dueDate ? "text-foreground" : "text-muted-foreground"}>
                    {selectedDueDate ? format(selectedDueDate, "PPP") : "Pick a date"}
                  </span>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    selected={selectedDueDate}
                    onSelect={(date) => {
                      setDueDate(date ? format(date, "yyyy-MM-dd") : "");
                      if (date) setCalendarMonth(date);
                    }}
                  />
                  {dueDate && (
                    <div className="border-t border-border p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setDueDate("")}
                      >
                        Clear deadline
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Assignees</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Select task assignees"
                >
                  <Users className="size-4 shrink-0 text-muted-foreground" />
                  <span className={assigneeIds.length ? "truncate" : "truncate text-muted-foreground"}>
                    {assigneeIds.length
                      ? `${assigneeIds.length} member${assigneeIds.length === 1 ? "" : "s"} selected`
                      : "Assign members"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-2">
                  <div className="relative mb-2">
                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                      onPointerDown={(event) => event.stopPropagation()}
                      placeholder="Search members..."
                      className="h-9 pl-8"
                      aria-label="Search members"
                    />
                  </div>
                  {workspaceMembers.isLoading || projectMembers.isLoading ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      Loading members…
                    </p>
                  ) : filteredMembers.length ? (
                    <div className="max-h-52 overflow-y-auto">
                      {filteredMembers.map((member) => (
                      <DropdownMenuCheckboxItem
                        key={member._id}
                        checked={assigneeIds.includes(member._id)}
                        onCheckedChange={() => toggleAssignee(member._id)}
                        className="cursor-pointer gap-2 px-2 py-2"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary">
                          {`${member.firstName[0] ?? ""}${member.lastName[0] ?? ""}`}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {member.firstName} {member.lastName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {member.email}
                          </span>
                        </span>
                      </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      {members.length ? "No members match your search." : "No members available to assign."}
                    </p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedAssignees.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedAssignees.map((member) => (
                    <span
                      key={member._id}
                      className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {member.firstName} {member.lastName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {task && !isDeleting && (
          <section className="mt-6 border-t border-border pt-5">
            <div className="flex items-center gap-2"><MessageSquare className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Comments</h3></div>
            <div className="mt-3 space-y-3">
              {comments.isLoading ? <p className="text-xs text-muted-foreground">Loading comments…</p> : comments.data?.comments.map((item) => {
                const authorName = `${item.createdBy.firstName} ${item.createdBy.lastName}`;

                return (
                  <article key={item._id} className="flex gap-3 rounded-xl bg-muted/50 p-3 text-sm">
                    <UserAvatar
                      name={authorName}
                      avatar={item.createdBy.avatar}
                      size="sm"
                      fallback="first-letter"
                      className="ring-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{authorName}</p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.content}</p>
                    </div>
                  </article>
                );
              })}
              {!comments.data?.comments.length && <p className="text-xs text-muted-foreground">No comments yet.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={2} placeholder="Write a comment…" />
              <Button type="button" size="sm" onClick={addComment} disabled={!comment.trim() || comments.create.isPending}>Post</Button>
            </div>
          </section>
        )}

        {formError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
        {!isDetails && (
        <div className="mt-6 flex justify-end gap-3">
          {task && !isDeleting && !isDetails && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={() => setIsDeleteConfirmation(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          )}
          <>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant={isDeleting ? "destructive" : "default"} disabled={isPending || (!isDeleting && (!title.trim() || !columnId))}>
              {isPending ? "Saving…" : isDeleting ? "Delete task" : task ? "Save changes" : "Create task"}
            </Button>
          </>
        </div>
        )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
