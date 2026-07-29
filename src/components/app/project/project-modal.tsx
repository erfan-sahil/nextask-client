"use client";

import { AlertTriangle, FolderKanban } from "lucide-react";
import { useState } from "react";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import type { ProjectDoc } from "@/types/domain";

type ProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  project?: ProjectDoc;
  mode: "create" | "edit" | "delete";
};

export function ProjectModal({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceName,
  project,
  mode,
}: ProjectModalProps) {
  const projects = useProjects(workspaceId);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const isPending =
    projects.create.isPending || projects.update.isPending || projects.remove.isPending;
  const isCreating = mode === "create";
  const isDeleting = mode === "delete";
  const title = isCreating
    ? "Create project"
    : isDeleting
      ? "Delete project"
      : "Edit project";

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      if (isDeleting && project) {
        await projects.remove.mutateAsync({
          workspaceId,
          projectId: project._id,
        });
      } else if (project) {
        await projects.update.mutateAsync({
          workspaceId,
          projectId: project._id,
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await projects.create.mutateAsync({
          workspaceId,
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
          <AppModalHeader
            title={title}
            description={
              isCreating
                ? `Add a new project to ${workspaceName}.`
                : isDeleting
                  ? `This will permanently delete ${project?.name}.`
                  : `Update the details for ${project?.name}.`
            }
            icon={isDeleting ? AlertTriangle : FolderKanban}
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
                  <p className="text-sm font-medium text-foreground">
                    Delete “{project?.name}”?
                  </p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    This will permanently remove the project and all of its boards and tasks.
                  </p>
                </div>
              </div>
            ) : (
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
                  ? "Delete project"
                  : isCreating
                    ? "Create project"
                    : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
