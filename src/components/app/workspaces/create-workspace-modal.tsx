"use client";

import { useState } from "react";
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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<WorkspaceDoc["visibility"]>("PRIVATE");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  function closeModal() {
    if (workspaces.create.isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Workspace name is required");
      return;
    }
    if (!visibility) {
      setFormError("Visibility is required");
      return;
    }

    try {
      const workspace = await workspaces.create.mutateAsync({
        name: trimmedName,
        visibility,
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      onOpenChange(false);
      onCreated?.(workspace);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

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
        onSubmit={handleSubmit}
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
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Product team"
              className="h-10 rounded-xl bg-background px-3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="workspace-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will your team work on?"
              rows={3}
              className="rounded-xl bg-background px-3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-visibility">Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => {
                if (value) setVisibility(value as WorkspaceDoc["visibility"]);
              }}
              required
            >
              <SelectTrigger
                id="workspace-visibility"
                className="h-10 w-full rounded-xl bg-background px-3"
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
              workspaces.create.isPending || !name.trim() || !visibility
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
