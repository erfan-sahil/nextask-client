"use client";

import { ArrowRight, Layers, Plus, Users } from "lucide-react";
import Link from "next/link";
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
import { appRoutes } from "@/config/navigation";
import { useWorkspaces } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
import type { WorkspaceDoc } from "@/types/domain";

function WorkspaceCard({ workspace }: { workspace: WorkspaceDoc }) {
  return (
    <Link
      href={appRoutes.workspace(workspace.slug)}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            "bg-primary/10 text-primary",
          )}
        >
          {workspace.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {workspace.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {workspace.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="size-3.5" />
          {workspace.projectCount} projects
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {workspace.memberCount} members
        </span>
        <ArrowRight className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100 text-primary" />
      </div>
    </Link>
  );
}

export function WorkspacesPage() {
  const workspaces = useWorkspaces();
  const workspaceList = workspaces.data?.workspaces ?? [];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] =
    useState<WorkspaceDoc["visibility"]>("PRIVATE");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function closeCreateDialog() {
    if (workspaces.create.isPending) return;
    setIsCreateDialogOpen(false);
    setFormError(null);
  }

  async function handleCreateWorkspace(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    try {
      const workspace = await workspaces.create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
      });
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      setIsCreateDialogOpen(false);
      setToastMessage(`${workspace.name} was created successfully.`);
      window.setTimeout(() => setToastMessage(null), 4000);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {workspaceList.length} workspace
            {workspaceList.length !== 1 ? "s" : ""} you&apos;re part of
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="size-4" />
          New workspace
        </button>
      </div>

      {/* Grid */}
      {workspaces.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading workspaces…</p>
      ) : workspaces.isError ? (
        <p className="text-sm text-destructive">
          Unable to load workspaces. Please try again.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaceList.map((workspace) => (
            <WorkspaceCard key={workspace._id} workspace={workspace} />
          ))}

          {/* Create new card */}
          <button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex min-h-35 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-5 text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-primary dark:hover:bg-emerald-400/10"
          >
            <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-current">
              <Plus className="size-5" />
            </div>
            <span className="text-sm font-medium">Create a workspace</span>
          </button>
        </div>
      )}

      {isCreateDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close create workspace dialog"
            onClick={closeCreateDialog}
          />
          <form
            onSubmit={handleCreateWorkspace}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div>
              <h2
                id="create-workspace-title"
                className="text-lg font-semibold tracking-tight"
              >
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
                <Label htmlFor="workspace-description">Description</Label>
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
                <Label>Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as WorkspaceDoc["visibility"])
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-xl bg-background px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="PRIVATE">
                      Private — invite only
                    </SelectItem>
                    <SelectItem value="TEAM">
                      Team — visible to your team
                    </SelectItem>
                    <SelectItem value="PUBLIC">
                      Public — visible to everyone
                    </SelectItem>
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
                onClick={closeCreateDialog}
                disabled={workspaces.create.isPending}
                variant="outline"
                className="h-10 rounded-xl px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={workspaces.create.isPending || !name.trim()}
                className="h-10 rounded-xl px-4"
              >
                {workspaces.create.isPending ? "Creating…" : "Create workspace"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {toastMessage && (
        <div
          className="fixed right-4 bottom-4 z-50 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg"
          role="status"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
