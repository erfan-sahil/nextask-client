"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

  const title = isDeleting ? "Delete column" : column ? "Edit column" : "Create column";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-background/80 backdrop-blur-sm" aria-label="Close column dialog" onClick={() => !isPending && onOpenChange(false)} />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isDeleting ? `Delete ${column?.name}? The column must be empty first.` : "Columns organize tasks on this board."}
        </p>
        {isDeleting ? (
          <p className="mt-6 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">This action cannot be undone.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5"><Label htmlFor="column-name">Column name</Label><Input id="column-name" required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. In progress" /></div>
            <div className="space-y-1.5"><Label htmlFor="column-color">Color</Label><Input id="column-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 p-1" /></div>
          </div>
        )}
        {formError && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant={isDeleting ? "destructive" : "default"} disabled={isPending || (!isDeleting && !name.trim())}>
            {isPending ? "Saving…" : isDeleting ? "Delete column" : column ? "Save changes" : "Create column"}
          </Button>
        </div>
      </form>
    </div>
  );
}
