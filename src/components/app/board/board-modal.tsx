"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBoards } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import {
  boardFormSchema,
  type BoardFormValues,
} from "@/lib/validations/board";
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
  const [formError, setFormError] = useState<string | null>(null);
  const isPending =
    boards.create.isPending || boards.update.isPending || boards.remove.isPending;
  const isCreating = mode === "create";
  const isDeleting = mode === "delete";
  const title = isCreating ? "Create board" : isDeleting ? "Delete board" : "Edit board";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: {
      name: board?.name ?? "",
      description: board?.description ?? "",
    },
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: board?.name ?? "",
      description: board?.description ?? "",
    });
    setFormError(null);
  }, [isOpen, board, reset]);

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: BoardFormValues) {
    setFormError(null);

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
    };

    try {
      if (board) {
        await boards.update.mutateAsync({
          workspaceId,
          projectId,
          boardId: board._id,
          ...payload,
        });
      } else {
        await boards.create.mutateAsync({
          workspaceId,
          projectId,
          ...payload,
        });
      }

      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!board) return;

    setFormError(null);

    try {
      await boards.remove.mutateAsync({
        workspaceId,
        projectId,
        boardId: board._id,
      });
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
        <form onSubmit={isDeleting ? handleDelete : handleSubmit(onSubmit)}>
          <AppModalHeader
            title={title}
            description={
              isCreating
                ? `Add a new board to ${projectName}.`
                : isDeleting
                  ? `This will permanently delete ${board?.name}.`
                  : `Update the details for ${board?.name}.`
            }
            icon={isDeleting ? AlertTriangle : LayoutDashboard}
            tone={isDeleting ? "destructive" : "default"}
            onClose={closeModal}
            closeLabel={`Close ${title.toLowerCase()} dialog`}
            disabled={isPending}
          />

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
                    autoFocus
                    placeholder="e.g. Product roadmap"
                    className="h-10 rounded-xl bg-background px-3"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="board-description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="board-description"
                    placeholder="What is this board for?"
                    rows={3}
                    className="rounded-xl bg-background px-3"
                    aria-invalid={Boolean(errors.description)}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
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
              disabled={isPending || (!isDeleting && !nameValue?.trim())}
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
