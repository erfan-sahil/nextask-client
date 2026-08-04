"use client";

import { AlertTriangle, BriefcaseBusiness } from "lucide-react";
import { useState } from "react";
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
  const [name, setName] = useState(workspace?.name ?? "");
  const [description, setDescription] = useState(workspace?.description ?? "");
  const [visibility, setVisibility] = useState<WorkspaceDoc["visibility"]>(
    workspace?.visibility ?? "PRIVATE",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const isDeleting = mode === "delete";
  const isEditing = mode === "edit";
  const isPending =
    workspaces.create.isPending || workspaces.update.isPending || workspaces.remove.isPending;

  function closeModal() {
    if (!isPending) onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      if (isDeleting && workspace) {
        await workspaces.remove.mutateAsync(workspace._id);
        onDeleted?.(workspace);
      } else if (isEditing && workspace) {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setFormError("Workspace name is required");
          return;
        }
        if (!visibility) {
          setFormError("Visibility is required");
          return;
        }
        await workspaces.update.mutateAsync({
          workspaceId: workspace._id,
          name: trimmedName,
          description: description.trim() || undefined,
          visibility,
        });
      } else {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setFormError("Workspace name is required");
          return;
        }
        if (!visibility) {
          setFormError("Visibility is required");
          return;
        }
        const createdWorkspace = await workspaces.create.mutateAsync({
          name: trimmedName,
          visibility,
          description: description.trim() || undefined,
        });
        onCreated?.(createdWorkspace);
      }

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
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
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
                    required
                    autoFocus
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Product team"
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
                    <SelectTrigger id="workspace-visibility" className="h-10 w-full cursor-pointer rounded-xl bg-background px-3">
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
                isPending || (!isDeleting && (!name.trim() || !visibility))
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
