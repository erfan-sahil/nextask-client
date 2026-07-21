"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBoards } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import type { BoardDoc } from "@/types/domain";

type BoardModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  projectId: string;
  projectName: string;
  board?: BoardDoc;
  mode: "create" | "edit" | "delete";
};

export function BoardModal({
  isOpen,
  onOpenChange,
  workspaceId,
  projectId,
  projectName,
  board,
  mode,
}: BoardModalProps) {
  const boards = useBoards(workspaceId, projectId);
  const [name, setName] = useState(board?.name ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const isPending =
    boards.create.isPending || boards.update.isPending || boards.remove.isPending;
  const isCreating = mode === "create";
  const isDeleting = mode === "delete";
  const title = isCreating ? "Create board" : isDeleting ? "Delete board" : "Edit board";

  if (!isOpen) return null;

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      if (isDeleting && board) {
        await boards.remove.mutateAsync({
          workspaceId,
          projectId,
          boardId: board._id,
        });
      } else if (board) {
        await boards.update.mutateAsync({
          workspaceId,
          projectId,
          boardId: board._id,
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await boards.create.mutateAsync({
          workspaceId,
          projectId,
          name: name.trim(),
          description: description.trim() || undefined,
        });
      }

      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label={`Close ${title.toLowerCase()} dialog`}
        onClick={closeModal}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div>
          <h2 id="board-modal-title" className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCreating
              ? `Add a new board to ${projectName}.`
              : isDeleting
                ? `This will permanently delete ${board?.name}.`
                : `Update the details for ${board?.name}.`}
          </p>
        </div>

        {isDeleting ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This action cannot be undone.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="board-name">Board name</Label>
              <Input
                id="board-name"
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Product roadmap"
                className="h-10 rounded-xl bg-background px-3"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="board-description">Description</Label>
              <Textarea
                id="board-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this board for?"
                rows={3}
                className="rounded-xl bg-background px-3"
              />
            </div>
          </div>
        )}

        {formError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            onClick={closeModal}
            disabled={isPending}
            variant="outline"
            className="h-10 rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || (!isDeleting && !name.trim())}
            variant={isDeleting ? "destructive" : "default"}
            className="h-10 rounded-xl px-4"
          >
            {isPending
              ? isDeleting
                ? "Deleting…"
                : isCreating
                  ? "Creating…"
                  : "Saving…"
              : isDeleting
                ? "Delete board"
                : isCreating
                  ? "Create board"
                  : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
