"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  workspaceName: string;
};

export function CreateProjectModal({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceName,
}: CreateProjectModalProps) {
  const projects = useProjects(workspaceId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  function closeModal() {
    if (projects.create.isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      await projects.create.mutateAsync({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName("");
      setDescription("");
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
      aria-labelledby="create-project-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close create project dialog"
        onClick={closeModal}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div>
          <h2 id="create-project-title" className="text-lg font-semibold tracking-tight">
            Create project
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new project to {workspaceName}.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Website redesign"
              className="h-10 rounded-xl bg-background px-3"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="rounded-xl bg-background px-3"
            />
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
            disabled={projects.create.isPending}
            variant="outline"
            className="h-10 rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={projects.create.isPending || !name.trim()}
            className="h-10 rounded-xl px-4"
          >
            {projects.create.isPending ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
