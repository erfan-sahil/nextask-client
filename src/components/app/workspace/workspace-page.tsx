"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import { mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Project, Workspace } from "@/types/workspace";

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  workspaceSlug,
}: {
  project: Project;
  workspaceSlug: string;
}) {
  const pct =
    project.taskCount === 0
      ? 0
      : Math.round((project.completedTaskCount / project.taskCount) * 100);

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();

  return (
    <Link
      href={appRoutes.project(workspaceSlug, project.id)}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold border",
            project.color,
          )}
        >
          {project.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {project.description}
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <ProgressBar
          value={project.completedTaskCount}
          max={project.taskCount}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          {project.memberCount}
        </span>
        {project.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1",
              isOverdue && "text-destructive",
            )}
          >
            <Calendar className="size-3" />
            {new Date(project.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-primary">
          <CheckCircle2 className="size-3" />
          {pct}% done
        </span>
      </div>
    </Link>
  );
}

type WorkspacePageProps = {
  workspace: Workspace;
};

export function WorkspacePage({ workspace }: WorkspacePageProps) {
  const projects = mockProjects.filter((p) => p.workspaceId === workspace.id);

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Workspace Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
              workspace.color,
            )}
          >
            {workspace.initials}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {workspace.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="size-4" />
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {workspace.memberCount} members
          </span>
        </div>
      </div>

      {/* Tab bar (static for now) */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {["Projects", "Members", "Settings"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "Projects"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <FolderKanban className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No projects yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first project to start tracking work.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspaceSlug={workspace.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
