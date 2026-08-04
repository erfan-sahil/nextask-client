"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, BriefcaseBusiness } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaces } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import {
  workspaceFormSchema,
  type WorkspaceFormValues,
} from "@/lib/validations/workspace";
import type { WorkspaceDoc } from "@/types/domain";

type WorkspaceModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mode: "create" | "edit" | "delete";
  workspace?: WorkspaceDoc;
  onCreated?: (workspace: WorkspaceDoc) => void;
  onDeleted?: (workspace: WorkspaceDoc) => void;
};

export function WorkspaceModal({
  isOpen,
  onOpenChange,
  mode,
  workspace,
  onCreated,
  onDeleted,
}: WorkspaceModalProps) {
  const workspaces = useWorkspaces();
  const [formError, setFormError] = useState<string | null>(null);
  const isDeleting = mode === "delete";
  const isEditing = mode === "edit";
  const isPending =
    workspaces.create.isPending || workspaces.update.isPending || workspaces.remove.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
      visibility: workspace?.visibility ?? "PRIVATE",
    },
  });

  const nameValue = watch("name");
  const visibilityValue = watch("visibility");

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
      visibility: workspace?.visibility ?? "PRIVATE",
    });
    setFormError(null);
  }, [isOpen, workspace, reset]);

  function closeModal() {
    if (!isPending) onOpenChange(false);
  }

  async function onSubmit(values: WorkspaceFormValues) {
    setFormError(null);

    const payload = {
      name: values.name.trim(),
      visibility: values.visibility,
      description: values.description?.trim() || undefined,
    };

    try {
      if (isEditing && workspace) {
        await workspaces.update.mutateAsync({
          workspaceId: workspace._id,
          ...payload,
        });
      } else {
        const createdWorkspace = await workspaces.create.mutateAsync(payload);
        onCreated?.(createdWorkspace);
      }

      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace) return;

    setFormError(null);

    try {
      await workspaces.remove.mutateAsync(workspace._id);
      onDeleted?.(workspace);
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const heading = isDeleting
    ? "Delete workspace"
    : isEditing
      ? "Edit workspace"
      : "Create workspace";
  const descriptionText = isDeleting
    ? `This will permanently delete ${workspace?.name ?? "this workspace"}.`
    : isEditing
      ? "Update your workspace details and visibility."
      : "Set up a shared space for your team and projects.";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <form
          onSubmit={isDeleting ? handleDelete : handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <AppModalHeader
            title={heading}
            description={descriptionText}
            icon={isDeleting ? AlertTriangle : BriefcaseBusiness}
            tone={isDeleting ? "destructive" : "default"}
            onClose={closeModal}
            closeLabel="Close workspace modal"
            disabled={isPending}
          />

          <div className="px-6 pb-6">
            {isDeleting ? (
              <div className="mt-6 flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">Delete “{workspace?.name}”?</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    This permanently removes the workspace and its projects.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    autoFocus
                    placeholder="e.g. Product team"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-description">
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="workspace-description"
                    placeholder="What will your team work on?"
                    rows={3}
                    aria-invalid={Boolean(errors.description)}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-visibility">Visibility</Label>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value) field.onChange(value);
                        }}
                      >
                        <SelectTrigger
                          id="workspace-visibility"
                          className="h-10 w-full cursor-pointer rounded-xl bg-background px-3"
                          aria-invalid={Boolean(errors.visibility)}
                        >
                          <SelectValue>
                            {(value: string | null) =>
                              value
                                ? `${value[0]}${value.slice(1).toLowerCase()}`
                                : "Select visibility"
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="PRIVATE">Private</SelectItem>
                          <SelectItem value="TEAM">Team</SelectItem>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.visibility && (
                    <p className="text-sm text-destructive">
                      {errors.visibility.message}
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

          <div className="flex shrink-0 justify-end gap-3 border-t border-border px-6 py-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isDeleting ? "destructive" : "default"}
              disabled={
                isPending ||
                (!isDeleting && (!nameValue?.trim() || !visibilityValue))
              }
            >
              {isPending
                ? "Saving…"
                : isDeleting
                  ? "Delete workspace"
                  : isEditing
                    ? "Save changes"
                    : "Create workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
