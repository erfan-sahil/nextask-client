"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  FolderKanban,
  LayoutGrid,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import { mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Project, Workspace } from "@/types/workspace";

// ─── Stat chip ──────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Project card ────────────────────────────────────────────────────────────

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
  const isComplete = pct === 100;

  return (
    <Link
      href={appRoutes.project(workspaceSlug, project.id)}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold border-2",
            project.color,
          )}
        >
          {project.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {project.name}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
          <span
            className={cn(
              "font-semibold",
              isComplete
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground",
            )}
          >
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-emerald-500" : isOverdue ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="size-3" />
          {project.memberCount}
        </span>
        {project.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1",
              isOverdue && "font-medium text-destructive",
            )}
          >
            <Calendar className="size-3" />
            {new Date(project.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
        <span
          className={cn(
            "ml-auto flex items-center gap-1 font-medium",
            isComplete
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-primary",
          )}
        >
          <CheckCircle2 className="size-3" />
          {isComplete ? "Done" : `${pct}% done`}
        </span>
      </div>
    </Link>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type WorkspacePageProps = {
  workspace: Workspace;
};

export function WorkspacePage({ workspace }: WorkspacePageProps) {
  const projects = mockProjects.filter((p) => p.workspaceId === workspace.id);

  const totalTasks = projects.reduce((s, p) => s + p.taskCount, 0);
  const completedTasks = projects.reduce((s, p) => s + p.completedTaskCount, 0);
  const overallPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="px-4 py-6 sm:px-8 max-w-6xl">
      {/* ── Workspace header card ── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Accent strip */}
        <div className={cn("h-1 w-full", workspace.color.replace("text-", "bg-").split(" ")[0])} />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
                workspace.color,
              )}
            >
              {workspace.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {workspace.name}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {workspace.description}
              </p>
            </div>
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shrink-0"
            >
              <Plus className="size-4" />
              New project
            </button>
          </div>

          {/* Overall progress */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedTasks} of {totalTasks} tasks complete across all projects
              </span>
              <span className="font-semibold text-foreground">{overallPct}%</span>
            </div>
            <ProgressBar value={completedTasks} max={totalTasks} />
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-3">
            <StatChip
              icon={FolderKanban}
              label="Projects"
              value={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
              accent
            />
            <StatChip
              icon={Users}
              label="Members"
              value={`${workspace.memberCount} member${workspace.memberCount !== 1 ? "s" : ""}`}
            />
            <StatChip
              icon={LayoutGrid}
              label="Tasks"
              value={`${completedTasks}/${totalTasks}`}
            />
            <StatChip
              icon={TrendingUp}
              label="Completion"
              value={`${overallPct}% done`}
              accent={overallPct === 100}
            />
          </div>
        </div>
      </div>

      {/* ── Projects section ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Projects</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""} in this workspace
          </p>
        </div>
        <button
          type="button"
          className="sm:hidden flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <FolderKanban className="size-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No projects yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Create your first project to start organizing and tracking work in this workspace.
          </p>
          <button
            type="button"
            className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Create project
          </button>
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
