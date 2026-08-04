"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Columns3 } from "lucide-react";
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
import { useKanban } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import {
  columnFormSchema,
  DEFAULT_COLUMN_COLOR,
  type ColumnFormValues,
} from "@/lib/validations/column";
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

function resolveColumnColor(color?: string | null) {
  return color && /^#[0-9a-fA-F]{6}$/.test(color)
    ? color
    : DEFAULT_COLUMN_COLOR;
}

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
  const [formError, setFormError] = useState<string | null>(null);
  const isDeleting = mode === "delete";
  const isCreating = mode === "create";
  const isPending =
    kanban.createColumn.isPending ||
    kanban.updateColumn.isPending ||
    kanban.deleteColumn.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      name: column?.name ?? "",
      color: resolveColumnColor(column?.color),
    },
  });

  const nameValue = watch("name");
  const colorValue = watch("color") || DEFAULT_COLUMN_COLOR;

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: column?.name ?? "",
      color: resolveColumnColor(column?.color),
    });
    setFormError(null);
  }, [isOpen, column, reset]);

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: ColumnFormValues) {
    setFormError(null);

    const color =
      values.color && /^#[0-9a-fA-F]{6}$/.test(values.color)
        ? values.color
        : DEFAULT_COLUMN_COLOR;

    try {
      if (column) {
        await kanban.updateColumn.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          columnId: column._id,
          name: values.name.trim(),
          color,
        });
      } else {
        await kanban.createColumn.mutateAsync({
          workspaceId,
          projectId,
          boardId,
          name: values.name.trim(),
          color,
          position: nextPosition,
        });
      }
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!column) return;

    setFormError(null);

    try {
      await kanban.deleteColumn.mutateAsync({
        workspaceId,
        projectId,
        boardId,
        columnId: column._id,
      });
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const title = isDeleting
    ? "Delete column"
    : isCreating
      ? "Create column"
      : "Edit column";
  const description = isDeleting
    ? `This will permanently delete ${column?.name}.`
    : isCreating
      ? "Create a column to organize work on this board."
      : "Update this column's name and color.";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        <form
          onSubmit={isDeleting ? handleDelete : handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <AppModalHeader
            title={title}
            description={description}
            icon={isDeleting ? AlertTriangle : Columns3}
            tone={isDeleting ? "destructive" : "default"}
            onClose={closeModal}
            closeLabel="Close column modal"
            disabled={isPending}
          />

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
                    autoFocus
                    placeholder="e.g. In progress"
                    className="h-10 rounded-xl bg-background"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="column-color">
                    Color{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <div className="flex h-10 items-center gap-3 rounded-xl border border-input bg-background px-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                    <input
                      id="column-color"
                      type="color"
                      value={colorValue}
                      onChange={(event) => {
                        setValue("color", event.target.value, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      className="size-6 cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0 [&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0"
                    />
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: colorValue }}
                      aria-hidden="true"
                    />
                    <Input
                      {...register("color", {
                        onBlur: (event) => {
                          const nextColor = event.target.value.trim();
                          if (/^[0-9a-fA-F]{6}$/.test(nextColor)) {
                            setValue("color", `#${nextColor}`, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        },
                      })}
                      placeholder={DEFAULT_COLUMN_COLOR.toUpperCase()}
                      aria-label="Column color hex code"
                      aria-invalid={Boolean(errors.color)}
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 font-mono text-sm font-medium uppercase tracking-wide shadow-none focus-visible:border-0 focus-visible:ring-0"
                    />
                    <label
                      htmlFor="column-color"
                      className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                      Pick color
                    </label>
                  </div>
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color.message}</p>
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
              disabled={isPending || (!isDeleting && !nameValue?.trim())}
            >
              {isPending
                ? isDeleting
                  ? "Deleting…"
                  : isCreating
                    ? "Creating…"
                    : "Saving…"
                : isDeleting
                  ? "Delete column"
                  : isCreating
                    ? "Create column"
                    : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
