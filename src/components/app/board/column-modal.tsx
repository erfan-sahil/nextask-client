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
import { useKanban } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import type { ColumnDoc } from "@/types/domain";

type ColumnModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  projectId: string;
  boardId: string;
  nextPosition: number;
  mode: "create" | "edit" | "delete";
  column?: ColumnDoc;
};

export function ColumnModal({
  isOpen,
  onOpenChange,
  workspaceId,
  projectId,
  boardId,
  nextPosition,
  mode,
  column,
}: ColumnModalProps) {
  const kanban = useKanban(workspaceId, projectId, boardId);
  const [name, setName] = useState(column?.name ?? "");
  const [color, setColor] = useState(column?.color ?? "#64748b");
  const [colorInput, setColorInput] = useState(column?.color ?? "#64748b");
  const [formError, setFormError] = useState<string | null>(null);
  const isDeleting = mode === "delete";
  const isPending =
    kanban.createColumn.isPending ||
    kanban.updateColumn.isPending ||
    kanban.deleteColumn.isPending;

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!isDeleting && !/^#[0-9a-f]{6}$/i.test(colorInput)) {
      setFormError("Enter a valid hex color, for example #64748B.");
      return;
    }
    try {
      if (isDeleting && column) {
        await kanban.deleteColumn.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          columnId: column._id,
        });
      } else if (column) {
        await kanban.updateColumn.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          columnId: column._id,
          name: name.trim(),
          color,
        });
      } else {
        await kanban.createColumn.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          name: name.trim(),
          color,
          position: nextPosition,
        });
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const title = isDeleting
    ? "Delete column"
    : column
      ? "Edit column"
      : "Create column";
  const description = isDeleting
    ? `This will permanently delete ${column?.name}.`
    : column
      ? "Update this column's name and color."
      : "Create a column to organize work on this board.";

  function closeModal() {
    if (!isPending) onOpenChange(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="relative shrink-0 border-b border-border px-6 py-4 pr-16">
            <DialogTitle className={!isDeleting ? "text-primary" : undefined}>
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close column modal"
              disabled={isPending}
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="px-6 py-6">
            {isDeleting ? (
              <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Delete “{column?.name}”?
                  </p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Move or remove its tasks before deleting this column.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="column-name">Column name</Label>
                  <Input
                    id="column-name"
                    required
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. In progress"
                    className="h-10 rounded-xl bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="column-color">Color</Label>
                  <div className="flex h-10 items-center gap-3 rounded-xl border border-input bg-background px-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                    <input
                      id="column-color"
                      type="color"
                      value={color}
                      onChange={(event) => {
                        setColor(event.target.value);
                        setColorInput(event.target.value);
                      }}
                      className="size-6 cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0"
                    />
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <Input
                      value={colorInput}
                      onChange={(event) => {
                        const nextColor = event.target.value;
                        setColorInput(nextColor);
                        if (/^#[0-9a-f]{6}$/i.test(nextColor)) {
                          setColor(nextColor);
                        }
                      }}
                      onBlur={() => {
                        if (/^[0-9a-f]{6}$/i.test(colorInput)) {
                          const normalizedColor = `#${colorInput}`;
                          setColor(normalizedColor);
                          setColorInput(normalizedColor);
                        }
                      }}
                      placeholder="#64748B"
                      aria-label="Column color hex code"
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 font-mono text-sm font-medium uppercase tracking-wide shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                    <label
                      htmlFor="column-color"
                      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      Pick color
                    </label>
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isDeleting ? "destructive" : "default"}
              disabled={isPending || (!isDeleting && !name.trim())}
            >
              {isPending
                ? "Saving…"
                : isDeleting
                  ? "Delete column"
                  : column
                    ? "Save changes"
                    : "Create column"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
