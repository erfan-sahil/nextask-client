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
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardModal } from "@/components/app/board/board-modal";
import { ProjectMemberInviteModal } from "@/components/app/project/project-member-invite-modal";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { mockBoards } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import { canManageWorkspaceContent } from "@/lib/workspace-permissions";
import type { BoardDoc } from "@/types/domain";
import type { BoardMeta, Project, Workspace } from "@/types/workspace";
import {
  useBoards,
  useProject,
  useProjectMembers,
  useWorkspaceBySlug,
} from "@/hooks/use-workflow";
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
        className="cursor-pointer transition-colors hover:text-foreground"
      >
        Workspaces
      </Link>
      <ChevronRight className="size-3.5" />
      <Link
        href={appRoutes.workspace(workspace.slug)}
        className="cursor-pointer transition-colors hover:text-foreground"
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
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(boardHref)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(boardHref);
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
        </div>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(event) => event.stopPropagation()}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-emerald-500/5 hover:text-foreground group-hover:opacity-100"
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", dot)} />
          <span className="text-xs text-muted-foreground">
            {board.taskCount} task{board.taskCount !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
          Board
        </span>
      </div>
    </div>
  );
}

type MockProjectPageProps = {
  workspace: Workspace;
  project: Project;
};

type ProjectPageProps =
  | MockProjectPageProps
  | { workspaceSlug: string; projectId: string };

function ConnectedProjectPage({
  workspaceSlug,
  projectId,
}: {
  workspaceSlug: string;
  projectId: string;
}) {
  const [boardModal, setBoardModal] = useState<
    { mode: "create" } | { mode: "edit" | "delete"; board: BoardDoc } | null
  >(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { workspace, isLoading: isWorkspaceLoading } =
    useWorkspaceBySlug(workspaceSlug);
  const project = useProject(workspace?._id, projectId);
  const boards = useBoards(workspace?._id, projectId);
  const projectMembers = useProjectMembers(workspace?._id, projectId);

  if (isWorkspaceLoading || project.isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading project…</div>
    );
  }
  if (!workspace || !project.data) {
    return (
      <div className="p-8 text-sm text-destructive">
        Project not found or you do not have access.
      </div>
    );
  }

  const canManageBoards = canManageWorkspaceContent(workspace.membershipRole);
  const currentProjectMembership = projectMembers.data?.members.find(
    (member) => member.userId._id === user?._id,
  );
  const canInviteProjectMembers =
    workspace.membershipRole === "OWNER" ||
    workspace.membershipRole === "ADMIN" ||
    currentProjectMembership?.role === "OWNER" ||
    currentProjectMembership?.role === "ADMIN";

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <nav className="mb-8 flex gap-2 text-sm text-muted-foreground">
        <Link
          href={appRoutes.workspace(workspace.slug)}
          className="cursor-pointer transition-colors hover:text-foreground"
        >
          {workspace.name}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{project.data.name}</span>
      </nav>

      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold">{project.data.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {project.data.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-nowrap items-center gap-2">
              {canInviteProjectMembers && (
                <Button
                  type="button"
                  variant="outline"
                  size="page"
                  className="px-2.5 sm:px-4"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <UserPlus className="size-4" />
                  <span className="sm:hidden">Invite</span>
                  <span className="hidden sm:inline">Invite member</span>
                </Button>
              )}
              {canManageBoards && (
                <Button
                  type="button"
                  size="page"
                  className="px-2.5 sm:px-4"
                  onClick={() => setBoardModal({ mode: "create" })}
                >
                  <Plus className="size-4" />
                  <span className="sm:hidden">Board</span>
                  <span className="hidden sm:inline">New board</span>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-4" />
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground">Tasks</p>
                <p className="text-sm font-semibold text-foreground">
                  {project.data.taskCount} task
                  {project.data.taskCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="size-4" />
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground">Status</p>
                <p className="text-sm font-semibold capitalize text-foreground">
                  {project.data.status.replaceAll("_", " ").toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-5">
        <h2 className="font-semibold">Boards</h2>
        <p className="text-xs text-muted-foreground">
          {boards.data?.pagination.total ?? 0} boards in this project
        </p>
      </div>

      {boards.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading boards…</p>
      ) : !boards.data?.boards.length ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Columns3 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No boards yet</p>
          {canManageBoards && (
            <Button
              type="button"
              size="page"
              onClick={() => setBoardModal({ mode: "create" })}
              className="mt-4"
            >
              Create board
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.data.boards.map((board) => {
            const boardHref = appRoutes.board(
              workspace.slug,
              projectId,
              board._id,
            );

            return (
              <article
                key={board._id}
                role="link"
                tabIndex={0}
                onClick={() => router.push(boardHref)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(boardHref);
                  }
                }}
                className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Columns3 className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
                          {board.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {board.description || "No description yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {canManageBoards && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(event) => event.stopPropagation()}
                        onPointerDown={(event) => event.stopPropagation()}
                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
                        aria-label={`Board actions for ${board.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setBoardModal({ mode: "edit", board });
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="gap-2"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(event) => {
                            event.stopPropagation();
                            setBoardModal({ mode: "delete", board });
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {canManageBoards && boardModal && (
        <BoardModal
          key={
            boardModal.mode === "create"
              ? "create"
              : `${boardModal.mode}-${boardModal.board._id}`
          }
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) setBoardModal(null);
          }}
          workspaceId={workspace._id}
          projectId={projectId}
          projectName={project.data.name}
          mode={boardModal.mode}
          board={boardModal.mode === "create" ? undefined : boardModal.board}
        />
      )}
      {canInviteProjectMembers && (
        <ProjectMemberInviteModal
          isOpen={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          workspaceId={workspace._id}
          projectId={projectId}
          projectName={project.data.name}
        />
      )}
    </div>
  );
}

export function ProjectPage(props: ProjectPageProps) {
  if ("workspaceSlug" in props) return <ConnectedProjectPage {...props} />;
  const { workspace, project } = props;
  const boards = mockBoards.filter((b) => b.projectId === project.id);
  const pct =
    project.taskCount === 0
      ? 0
      : Math.round((project.completedTaskCount / project.taskCount) * 100);

  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date();

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
            <Button
              type="button"
              size="page"
              className="hidden shrink-0 sm:inline-flex"
            >
              <Plus className="size-4" />
              New board
            </Button>
          </div>

          {/* Progress section */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {project.completedTaskCount} of {project.taskCount} tasks
                complete
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
            {boards.length} board{boards.length !== 1 ? "s" : ""} in this
            project
          </p>
        </div>
        <Button
          type="button"
          size="page-sm"
          className="sm:hidden"
        >
          <Plus className="size-4" />
          New board
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Columns3 className="size-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No boards yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Boards let you organize and track tasks visually. Create your first
            board to get started.
          </p>
          <Button
            type="button"
            size="page"
            className="mt-5"
          >
            <Plus className="size-4" />
            Create board
          </Button>
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
