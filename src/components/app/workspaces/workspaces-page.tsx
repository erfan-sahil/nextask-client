"use client";

import { ArrowRight, Layers, Plus, Users } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link
      href={appRoutes.workspace(workspace.slug)}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            workspace.color,
          )}
        >
          {workspace.initials}
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
  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mockWorkspaces.length} workspace
            {mockWorkspaces.length !== 1 ? "s" : ""} you&apos;re part of
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          New workspace
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockWorkspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}

        {/* Create new card */}
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-5 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary min-h-[140px]"
        >
          <div className="flex size-11 items-center justify-center rounded-xl border-2 border-dashed border-current">
            <Plus className="size-5" />
          </div>
          <span className="text-sm font-medium">Create a workspace</span>
        </button>
      </div>
    </div>
  );
}
