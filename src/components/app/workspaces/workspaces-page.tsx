"use client";

import { ArrowRight, Layers, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WorkspaceModal } from "@/components/app/workspaces/workspace-modal";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/config/navigation";
import { useWorkspaces } from "@/hooks/use-workflow";
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        <Button
          type="button"
          size="page"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="size-4" />
          New workspace
        </Button>
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

      <WorkspaceModal
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        onCreated={(workspace) => {
          setToastMessage(`${workspace.name} was created successfully.`);
          window.setTimeout(() => setToastMessage(null), 4000);
        }}
      />

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
