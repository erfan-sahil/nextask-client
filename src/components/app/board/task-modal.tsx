"use client";

import { MessageSquare, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  mode: "create" | "edit" | "delete";
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
  const [columnId, setColumnId] = useState(
    task ? getColumnId(task.columnId) : initialColumnId ?? columns[0]?._id ?? "",
  );
  const [assigneeIds, setAssigneeIds] = useState(
    task?.assignees.map((assignee) => assignee._id) ?? [],
  );
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);
  const isDeleting = mode === "delete" || isDeleteConfirmation;
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

  const heading = isDeleting ? "Delete task" : task ? "Edit task" : "Create task";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>
          {isDeleting ? `This will permanently delete ${task?.title}.` : "Add the details needed to complete this work."}
            </DialogDescription>
          </DialogHeader>

        {isDeleting ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">This action cannot be undone.</p>
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
                <SelectTrigger id="task-column" className="h-10 w-full rounded-xl bg-background px-3">
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
                <SelectTrigger id="task-priority" className="h-10 w-full rounded-xl bg-background px-3">
                  <SelectValue />
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Assignees</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex h-10 w-full items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label="Select task assignees"
                >
                  <Users className="size-4" />
                  <span className="truncate">
                    {assigneeIds.length
                      ? `${assigneeIds.length} member${assigneeIds.length === 1 ? "" : "s"} assigned`
                      : "Assign members"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {workspaceMembers.isLoading || projectMembers.isLoading ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      Loading members…
                    </p>
                  ) : members.length ? (
                    members.map((member) => (
                      <DropdownMenuCheckboxItem
                        key={member._id}
                        checked={assigneeIds.includes(member._id)}
                        onCheckedChange={() => toggleAssignee(member._id)}
                      >
                        {member.firstName} {member.lastName}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      No members available to assign.
                    </p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {task && !isDeleting && (
          <section className="mt-6 border-t border-border pt-5">
            <div className="flex items-center gap-2"><MessageSquare className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Comments</h3></div>
            <div className="mt-3 space-y-3">
              {comments.isLoading ? <p className="text-xs text-muted-foreground">Loading comments…</p> : comments.data?.comments.map((item) => (
                <article key={item._id} className="rounded-xl bg-muted/50 p-3 text-sm">
                  <p className="font-medium">{`${item.createdBy.firstName} ${item.createdBy.lastName}`}</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.content}</p>
                </article>
              ))}
              {!comments.data?.comments.length && <p className="text-xs text-muted-foreground">No comments yet.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={2} placeholder="Write a comment…" />
              <Button type="button" size="sm" onClick={addComment} disabled={!comment.trim() || comments.create.isPending}>Post</Button>
            </div>
          </section>
        )}

        {formError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          {task && !isDeleting && (
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
          <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant={isDeleting ? "destructive" : "default"} disabled={isPending || (!isDeleting && (!title.trim() || !columnId))}>
            {isPending ? "Saving…" : isDeleting ? "Delete task" : task ? "Save changes" : "Create task"}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
