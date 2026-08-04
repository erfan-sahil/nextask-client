"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarDays,
  CircleDot,
  Flag,
  ListTodo,
  MessageSquare,
  Search,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/user-avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/app/rich-text-editor";
import {
  useKanban,
  useProjectMembers,
  useTaskComments,
  useWorkspaceMembers,
  useWorkspaces,
} from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import {
  TASK_PRIORITY_VALUES,
  taskFormSchema,
  type TaskFormValues,
} from "@/lib/validations/task";
import type { ColumnDoc, TaskDoc, TaskPriority } from "@/types/domain";

function getColumnId(columnId: TaskDoc["columnId"]) {
  return typeof columnId === "string" ? columnId : columnId._id;
}

function renderCommentContent(content: string) {
  return content.split(/(@[a-z0-9_-]+)/gi).map((part, index) =>
    /^@[a-z0-9_-]+$/i.test(part) ? (
      <span
        key={`${part}-${index}`}
        className="inline-block rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
}

type TaskModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  columns: ColumnDoc[];
  mode: "assign" | "create" | "details" | "edit" | "delete";
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
  const comments = useTaskComments(
    workspaceId,
    projectId,
    boardId,
    mode === "details" ? task?._id : undefined,
  );
  const workspaces = useWorkspaces();
  const workspace = workspaces.data?.workspaces.find((item) => item._id === workspaceId);
  const shouldLoadMembers = isOpen && Boolean(workspaces.data);
  const workspaceMembers = useWorkspaceMembers(
    workspaceId,
    shouldLoadMembers && Boolean(workspace?.membershipRole),
  );
  const projectMembers = useProjectMembers(workspaceId, projectId, shouldLoadMembers);
  const [calendarMonth, setCalendarMonth] = useState(
    task?.dueDate ? new Date(task.dueDate) : new Date(),
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [comment, setComment] = useState("");
  const [commentMention, setCommentMention] = useState<{
    query: string;
    start: number;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const commentComposerRef = useRef<HTMLTextAreaElement>(null);
  const isDeleting = mode === "delete";
  const isDetails = mode === "details";
  const isAssigning = mode === "assign";
  const isPending =
    kanban.createTask.isPending ||
    kanban.updateTask.isPending ||
    kanban.deleteTask.isPending;

  const defaultFormValues = useMemo<TaskFormValues>(
    () => ({
      title: task?.title ?? "",
      details: task?.details ?? "",
      columnId: task
        ? getColumnId(task.columnId)
        : (initialColumnId ?? columns[0]?._id ?? ""),
      priority: task?.priority ?? "LOW",
      dueDate: task?.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
      assigneeIds: task?.assignees.map((assignee) => assignee._id) ?? [],
    }),
    [columns, initialColumnId, task],
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultFormValues,
  });

  const title = watch("title");
  const columnId = watch("columnId");
  const assigneeIds = watch("assigneeIds") ?? [];

  useEffect(() => {
    if (!isOpen) return;
    reset(defaultFormValues);
    setCalendarMonth(
      defaultFormValues.dueDate
        ? new Date(`${defaultFormValues.dueDate}T00:00:00`)
        : new Date(),
    );
    setFormError(null);
    setMemberSearch("");
  }, [defaultFormValues, isOpen, reset]);
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
  const commentMentionSuggestions = useMemo(() => {
    const query = commentMention?.query.toLowerCase() ?? "";
    return members
      .filter((member) => {
        const name = `${member.firstName} ${member.lastName}`.toLowerCase();
        return !query || member.username.includes(query) || name.includes(query);
      })
      .slice(0, 5);
  }, [commentMention?.query, members]);
  const selectedAssignees = useMemo(() => {
    const membersById = new Map(members.map((member) => [member._id, member]));
    const taskAssigneesById = new Map(task?.assignees.map((member) => [member._id, member]));

    return assigneeIds
      .map((memberId) => membersById.get(memberId) ?? taskAssigneesById.get(memberId))
      .filter((member) => member !== undefined)
  }, [assigneeIds, members, task?.assignees]);

  function toggleAssignee(memberId: string) {
    const currentAssigneeIds = getValues("assigneeIds") ?? [];
    setValue(
      "assigneeIds",
      currentAssigneeIds.includes(memberId)
        ? currentAssigneeIds.filter((id) => id !== memberId)
        : [...currentAssigneeIds, memberId],
      { shouldDirty: true },
    );
  }

  function updateCommentMention(value: string, caretPosition: number) {
    const textBeforeCaret = value.slice(0, caretPosition);
    const match = textBeforeCaret.match(/@([a-z0-9_-]*)$/i);
    setCommentMention(
      match ? { query: match[1], start: caretPosition - match[0].length } : null,
    );
  }

  function selectCommentMention(username: string) {
    if (!commentMention) return;

    const caretPosition = commentComposerRef.current?.selectionStart ?? comment.length;
    const insertedMention = `@${username} `;
    const nextComment = `${comment.slice(0, commentMention.start)}${insertedMention}${comment.slice(caretPosition)}`;
    const nextCaretPosition = commentMention.start + insertedMention.length;

    setComment(nextComment);
    setCommentMention(null);
    requestAnimationFrame(() => {
      commentComposerRef.current?.focus();
      commentComposerRef.current?.setSelectionRange(nextCaretPosition, nextCaretPosition);
    });
  }

  if (!isOpen) return null;

  function closeModal() {
    if (!isPending) onOpenChange(false);
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;

    setFormError(null);

    try {
      await kanban.deleteTask.mutateAsync({
        workspaceId,
        projectId,
        boardId,
        taskId: task._id,
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleAssign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!task) return;

    setFormError(null);

    try {
      await kanban.updateTask.mutateAsync({
        workspaceId,
        projectId,
        boardId,
        taskId: task._id,
        assignees: getValues("assigneeIds") ?? [],
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function onSubmit(values: TaskFormValues) {
    setFormError(null);

    const priority = values.priority ?? "LOW";

    try {
      if (task) {
        await kanban.updateTask.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          taskId: task._id,
          title: values.title.trim(),
          details: values.details ?? "",
          priority,
          columnId: values.columnId,
          assignees: values.assigneeIds ?? [],
          dueDate: values.dueDate || null,
        });
      } else {
        await kanban.createTask.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          title: values.title.trim(),
          details: values.details || undefined,
          priority,
          columnId: values.columnId,
          assignees: values.assigneeIds,
          dueDate: values.dueDate || undefined,
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
      setCommentMention(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const heading = isDeleting
    ? "Delete task"
    : isDetails
      ? task?.title ?? "Task details"
      : isAssigning
        ? "Assign members"
      : task
        ? "Edit task"
        : "Create task";
  const hasScrollableTaskContent = !isDeleting && !isAssigning;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent
        className={
          isDetails
            ? "h-[min(40rem,calc(100svh-2rem))] max-w-3xl overflow-hidden p-0"
            : isDeleting
              ? "max-w-md overflow-hidden p-0"
              : isAssigning
                ? "max-w-md overflow-hidden p-0"
              : hasScrollableTaskContent
                ? "h-[min(40rem,calc(100svh-2rem))] overflow-hidden p-0"
                : "overflow-hidden p-0"
        }
      >
        <form
          onSubmit={
            isDeleting
              ? handleDelete
              : isAssigning
                ? handleAssign
                : handleSubmit(onSubmit)
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <AppModalHeader
            title={heading}
            description={
              isDeleting
                ? `This will permanently delete ${task?.title}.`
                : isDetails
                  ? "Task details and discussion."
                  : isAssigning
                    ? "Choose the members responsible for this task."
                    : "Add the details needed to complete this work."
            }
            icon={isDeleting ? AlertTriangle : isDetails ? ListTodo : Users}
            tone={isDeleting ? "destructive" : "default"}
            onClose={closeModal}
            closeLabel="Close task modal"
            disabled={isPending}
          />

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 pb-6">
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
                Task details
              </div>
              {task.details ? (
                <div
                  className="mt-3 text-sm leading-6 text-foreground/80 [&_a]:text-primary [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: task.details }}
                />
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-border bg-background/60 px-4 py-4 text-center">
                  <p className="text-sm font-medium text-foreground/80">No task details yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add context, requirements, or a checklist to guide the work.
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
        ) : isAssigning && task ? (
          <section className="mt-6">
            <div className="space-y-1.5">
              <Label>Assignees</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm outline-none hover:bg-emerald-500/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          </section>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="task-title">Task title</Label>
              <Input
                id="task-title"
                autoFocus
                placeholder="e.g. Prepare launch brief"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Task details</Label>
              <Controller
                name="details"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={isPending}
                    ariaLabel="Task details"
                    placeholder="Add context, requirements, links, or a checklist…"
                  />
                )}
              />
              {errors.details && (
                <p className="text-sm text-destructive">{errors.details.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-column">Column</Label>
              <Controller
                name="columnId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger
                      id="task-column"
                      className="h-10 w-full cursor-pointer rounded-xl bg-background px-3"
                      aria-invalid={Boolean(errors.columnId)}
                    >
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
                )}
              />
              {errors.columnId && (
                <p className="text-sm text-destructive">{errors.columnId.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value as TaskPriority);
                    }}
                  >
                    <SelectTrigger
                      id="task-priority"
                      className="h-10 w-full cursor-pointer rounded-xl bg-background px-3"
                      aria-invalid={Boolean(errors.priority)}
                    >
                      <SelectValue>
                        {(value: string | null) =>
                          value
                            ? `${value[0]}${value.slice(1).toLowerCase()}`
                            : "Select priority"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align="start">
                      {TASK_PRIORITY_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value[0]}
                          {value.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      type="button"
                      className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm font-normal transition-colors hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      aria-label="Select task deadline"
                    >
                      <CalendarDays className="size-4 text-muted-foreground" />
                      <span
                        className={
                          field.value ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {field.value
                          ? format(new Date(`${field.value}T00:00:00`), "PPP")
                          : "Pick a date"}
                      </span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        selected={
                          field.value
                            ? new Date(`${field.value}T00:00:00`)
                            : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                          if (date) setCalendarMonth(date);
                        }}
                      />
                      {field.value && (
                        <div className="border-t border-border p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => field.onChange("")}
                          >
                            Clear deadline
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Assignees</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-3 text-left text-sm outline-none hover:bg-emerald-500/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

        {isDetails && task && (
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
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        {renderCommentContent(item.content)}
                      </p>
                    </div>
                  </article>
                );
              })}
              {!comments.data?.comments.length && <p className="text-xs text-muted-foreground">No comments yet.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Textarea
                  ref={commentComposerRef}
                  value={comment}
                  onChange={(event) => {
                    const value = event.target.value;
                    setComment(value);
                    updateCommentMention(value, event.target.selectionStart);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setCommentMention(null);
                  }}
                  rows={2}
                  placeholder="Write a comment… Use @username to mention someone."
                />
                {commentMention && (
                  <div className="absolute right-0 bottom-[calc(100%+0.5rem)] left-0 z-10 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg">
                    {commentMentionSuggestions.map((member) => {
                      const name = `${member.firstName} ${member.lastName}`.trim();
                      return (
                        <button
                          key={member._id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => selectCommentMention(member.username)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-emerald-500/5"
                        >
                          <UserAvatar name={name} avatar={member.avatar} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{name}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              @{member.username}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {!workspaceMembers.isLoading &&
                      !projectMembers.isLoading &&
                      !commentMentionSuggestions.length && (
                        <p className="px-2 py-1.5 text-xs text-muted-foreground">
                          No matching members
                        </p>
                      )}
                  </div>
                )}
              </div>
              <Button type="button" size="sm" onClick={addComment} disabled={!comment.trim() || comments.create.isPending}>Post</Button>
            </div>
          </section>
        )}

        {formError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
          </div>
        </ScrollArea>
        {!isDetails && (
        <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
          <>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isDeleting ? "destructive" : "default"}
              disabled={
                isPending ||
                (!isDeleting &&
                  !isAssigning &&
                  (!title?.trim() || !columnId))
              }
            >
              {isPending
                ? "Saving…"
                : isDeleting
                  ? "Delete task"
                  : isAssigning
                    ? "Assign members"
                    : task
                      ? "Save changes"
                      : "Create task"}
            </Button>
          </>
        </div>
        )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
