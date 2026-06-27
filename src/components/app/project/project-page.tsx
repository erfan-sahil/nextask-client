"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Columns3,
  ExternalLink,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/config/navigation";
import { mockBoards } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { BoardMeta, Project, Workspace } from "@/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Breadcrumb({
  workspace,
  project,
}: {
  workspace: Workspace;
  project: Project;
}) {
  return (
    <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link
        href={appRoutes.workspaces}
        className="hover:text-foreground transition-colors"
      >
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

function StatCard({
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
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          accent
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
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

function BoardCard({
  board,
  workspaceSlug,
  projectId,
  index,
}: {
  board: BoardMeta;
  workspaceSlug: string;
  projectId: string;
  index: number;
}) {
  const router = useRouter();
  const boardHref = appRoutes.board(workspaceSlug, projectId, board.id);

  const dotColors = [
    "bg-primary",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
  ];
  const dot = dotColors[index % dotColors.length];

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={boardHref}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Columns3 className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {board.name}
            </h3>
            {board.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {board.description}
              </p>
            )}
          </div>
        </Link>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => router.push(boardHref)}
              className="gap-2"
            >
              <ExternalLink className="size-3.5" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Pencil className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Footer row */}
      <Link href={boardHref} className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", dot)} />
          <span className="text-xs text-muted-foreground">
            {board.taskCount} task{board.taskCount !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
          Board
        </span>
      </Link>
    </div>
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

  const isOverdue =
    project.dueDate && new Date(project.dueDate) < new Date();

  return (
    <div className="px-4 py-6 sm:px-8 max-w-6xl">
      <Breadcrumb workspace={workspace} project={project} />

      {/* Project Header Card */}
      <div className="mb-8 rounded-2xl border border-border bg-card overflow-hidden">
        {/* Accent strip */}
        <div className="h-1 w-full bg-primary/20" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold border-2",
                project.color,
              )}
            >
              {project.name.slice(0, 1)}
            </div>

            {/* Title & description */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {project.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    pct === 100
                      ? "bg-green-500/10 text-green-600"
                      : isOverdue
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  {pct === 100 ? "Completed" : isOverdue ? "Overdue" : "Active"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Action */}
            <button
              type="button"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 shrink-0"
            >
              <Plus className="size-4" />
              New board
            </button>
          </div>

          {/* Progress section */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {project.completedTaskCount} of {project.taskCount} tasks complete
              </span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  pct === 100
                    ? "bg-green-500"
                    : isOverdue
                      ? "bg-destructive"
                      : "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-3">
            <StatCard
              icon={LayoutGrid}
              label="Boards"
              value={`${boards.length} board${boards.length !== 1 ? "s" : ""}`}
              accent
            />
            <StatCard
              icon={CheckCircle2}
              label="Progress"
              value={`${pct}% done`}
              accent={pct === 100}
            />
            <StatCard
              icon={TrendingUp}
              label="Tasks"
              value={`${project.completedTaskCount}/${project.taskCount}`}
            />
            {project.dueDate && (
              <StatCard
                icon={Calendar}
                label="Due date"
                value={new Date(project.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Boards section */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Boards</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {boards.length} board{boards.length !== 1 ? "s" : ""} in this project
          </p>
        </div>
        <button
          type="button"
          className="sm:hidden flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          New board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Columns3 className="size-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No boards yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Boards let you organize and track tasks visually. Create your first board to get started.
          </p>
          <button
            type="button"
            className="mt-5 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Create board
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, i) => (
            <BoardCard
              key={board.id}
              board={board}
              workspaceSlug={workspace.slug}
              projectId={project.id}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
