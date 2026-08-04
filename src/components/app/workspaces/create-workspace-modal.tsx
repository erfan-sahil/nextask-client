"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

type CreateWorkspaceModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreated?: (workspace: WorkspaceDoc) => void;
};

export function CreateWorkspaceModal({
  isOpen,
  onOpenChange,
  onCreated,
}: CreateWorkspaceModalProps) {
  const workspaces = useWorkspaces();
  const [formError, setFormError] = useState<string | null>(null);

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
      name: "",
      description: "",
      visibility: "PRIVATE",
    },
  });

  const nameValue = watch("name");
  const visibilityValue = watch("visibility");

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: "",
      description: "",
      visibility: "PRIVATE",
    });
    setFormError(null);
  }, [isOpen, reset]);

  function closeModal() {
    if (workspaces.create.isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: WorkspaceFormValues) {
    setFormError(null);

    try {
      const workspace = await workspaces.create.mutateAsync({
        name: values.name.trim(),
        visibility: values.visibility,
        description: values.description?.trim() || undefined,
      });
      reset({
        name: "",
        description: "",
        visibility: "PRIVATE",
      });
      onOpenChange(false);
      onCreated?.(workspace);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close create workspace dialog"
        onClick={closeModal}
      />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div>
          <h2 id="create-workspace-title" className="text-lg font-semibold tracking-tight">
            Create workspace
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up a shared space for your team and projects.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              autoFocus
              placeholder="e.g. Product team"
              className="h-10 rounded-xl bg-background px-3"
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
                    className="h-10 w-full rounded-xl bg-background px-3"
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
                    <SelectItem value="PRIVATE">Private — invite only</SelectItem>
                    <SelectItem value="TEAM">Team — visible to your team</SelectItem>
                    <SelectItem value="PUBLIC">Public — visible to everyone</SelectItem>
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

          {formError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            onClick={closeModal}
            disabled={workspaces.create.isPending}
            variant="outline"
            className="h-10 rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              workspaces.create.isPending ||
              !nameValue?.trim() ||
              !visibilityValue
            }
            className="h-10 rounded-xl px-4"
          >
            {workspaces.create.isPending ? "Creating…" : "Create workspace"}
          </Button>
        </div>
      </form>
    </div>
  );
}
