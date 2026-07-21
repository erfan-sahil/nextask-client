"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
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
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative border-b border-border px-6 py-4 pr-16">
            <DialogTitle className={!isDeleting ? "text-primary" : undefined}>
              {title}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? `Add a new board to ${projectName}.`
                : isDeleting
                  ? `This will permanently delete ${board?.name}.`
                  : `Update the details for ${board?.name}.`}
            </DialogDescription>
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Close ${title.toLowerCase()} dialog`}
              disabled={isPending}
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="px-6 pb-6">
            {isDeleting ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">Delete “{board?.name}”?</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    This will permanently remove this board and its tasks.
                  </p>
                </div>
              </div>
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
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" onClick={closeModal} disabled={isPending} variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || (!isDeleting && !name.trim())}
              variant={isDeleting ? "destructive" : "default"}
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
      </DialogContent>
    </Dialog>
  );
}
