"use client";

import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Columns3,
  FolderKanban,
  Layers,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import { mockBoards } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { BoardMeta, Project, Workspace } from "@/types/workspace";

function Breadcrumb({
  workspace,
  project,
}: {
  workspace: Workspace;
  project: Project;
}) {
  return (
    <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href={appRoutes.workspaces} className="hover:text-foreground transition-colors">
        Workspaces
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.workspace(workspace.slug)}
        className="hover:text-foreground transition-colors"
      >
        {workspace.name}
      </Link>
      <ChevronRight className="size-3.5" />
      <span className="font-medium text-foreground">{project.name}</span>
    </nav>
  );
}

function BoardCard({
  board,
  workspaceSlug,
  projectId,
}: {
  board: BoardMeta;
  workspaceSlug: string;
  projectId: string;
}) {
  return (
    <Link
      href={appRoutes.board(workspaceSlug, projectId, board.id)}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Columns3 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {board.name}
          </h3>
          {board.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {board.description}
            </p>
          )}
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3" />
          {board.taskCount} tasks
        </span>
      </div>
    </Link>
  );
}

type ProjectPageProps = {
  workspace: Workspace;
  project: Project;
};

export function ProjectPage({ workspace, project }: ProjectPageProps) {
  const boards = mockBoards.filter((b) => b.projectId === project.id);
  const pct =
    project.taskCount === 0
      ? 0
      : Math.round((project.completedTaskCount / project.taskCount) * 100);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumb workspace={workspace} project={project} />

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold border",
              project.color,
            )}
          >
            {project.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Columns3 className="size-4" />
            <span>{boards.length} board{boards.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" />
            <span>
              {project.completedTaskCount}/{project.taskCount} tasks · {pct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>{project.memberCount} members</span>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Due{" "}
                {new Date(project.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted max-w-xs">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {["Boards", "Tasks", "Members", "Settings"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              tab === "Boards"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Boards grid */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {boards.length} board{boards.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          New board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Columns3 className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No boards yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a board to start organizing tasks.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              workspaceSlug={workspace.slug}
              projectId={project.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
