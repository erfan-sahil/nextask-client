"use client";

import {
  CheckCircle2,
  FolderKanban,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateProjectModal } from "@/components/app/project/create-project-modal";
import { ProjectModal } from "@/components/app/project/project-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appRoutes } from "@/config/navigation";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { useProjects, useWorkspaceBySlug } from "@/hooks/use-workflow";
import { canManageWorkspaceContent } from "@/lib/workspace-permissions";
import type { ProjectDoc } from "@/types/domain";

const PROJECT_ACCENTS = [
  "bg-primary/10 text-primary",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-3/15 text-chart-3",
  "bg-chart-4/15 text-chart-4",
  "bg-chart-5/15 text-chart-5",
];

function formatStatus(status: ProjectDoc["status"]) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function WorkspacePage({ workspaceSlug }: { workspaceSlug: string }) {
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [projectModal, setProjectModal] = useState<{
    mode: "edit" | "delete";
    project: ProjectDoc;
  } | null>(null);
  const { workspace, isLoading, error } = useWorkspaceBySlug(workspaceSlug);
  const projects = useProjects(workspace?._id);

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 text-sm text-destructive">
        {error
          ? getErrorMessage(error)
          : "Workspace not found or you do not have access."}
      </div>
    );
  }

  const canManageProjects = canManageWorkspaceContent(workspace.membershipRole);
  const isProjectScoped = workspace.membershipRole === null;

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {workspace.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {workspace.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isProjectScoped
                  ? "Projects you have been invited to in this workspace."
                  : workspace.description}
              </p>
            </div>
            {canManageProjects && (
              <Button
                type="button"
                size="page"
                onClick={() => setIsCreateProjectModalOpen(true)}
                className="hidden shrink-0 sm:inline-flex"
              >
                <Plus className="size-4" />
                New project
              </Button>
            )}
          </div>
          {!isProjectScoped && (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-8">
                  <LayoutGrid className="size-3.5 sm:size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                    Projects
                  </p>
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {workspace.projectCount}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-8">
                  <Users className="size-3.5 sm:size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                    Members
                  </p>
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {workspace.memberCount}
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-2.5 text-center sm:flex-row sm:gap-3 sm:px-4 sm:py-3 sm:text-left">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-8">
                  <CheckCircle2 className="size-3.5 sm:size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                    Tasks
                  </p>
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {workspace.taskCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {isProjectScoped ? "Your projects" : "Projects"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {projects.data?.pagination.total ?? 0}{" "}
            {isProjectScoped
              ? "projects you can access"
              : "projects in this workspace"}
          </p>
        </div>
        {canManageProjects && (
          <Button
            type="button"
            size="page-sm"
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="sm:hidden"
          >
            <Plus className="size-4" />
            New project
          </Button>
        )}
      </div>

      {projects.isLoading ? (
        <p className="py-12 text-sm text-muted-foreground">Loading projects…</p>
      ) : !projects.data?.projects.length ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <FolderKanban className="size-6 text-muted-foreground/60" />
          </span>
          <p className="font-semibold">No projects yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Create a project to organize boards, tasks, and your team&apos;s
            work.
          </p>
          {canManageProjects && (
            <Button
              type="button"
              size="page"
              onClick={() => setIsCreateProjectModalOpen(true)}
              className="mt-5"
            >
              <Plus className="size-4" />
              Create project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.data.projects.map((project, index) => (
            <article
              key={project._id}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={appRoutes.project(workspace.slug, project._id)}
                  className="flex min-w-0 flex-1 items-start gap-3"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${PROJECT_ACCENTS[index % PROJECT_ACCENTS.length]}`}
                  >
                    {project.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {project.name}
                    </span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                      {project.description || "No description yet"}
                    </span>
                  </span>
                </Link>
                {canManageProjects && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Project actions for ${project.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() =>
                          setProjectModal({ mode: "edit", project })
                        }
                        className="gap-2"
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setProjectModal({ mode: "delete", project })
                        }
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" />
                  {project.taskCount} task{project.taskCount === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground/70">
                  <TrendingUp className="size-3" />
                  {formatStatus(project.status)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
      {canManageProjects && (
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onOpenChange={setIsCreateProjectModalOpen}
          workspaceId={workspace._id}
          workspaceName={workspace.name}
        />
      )}
      {canManageProjects && projectModal && (
        <ProjectModal
          key={`${projectModal.mode}-${projectModal.project._id}`}
          isOpen
          onOpenChange={(isOpen) => {
            if (!isOpen) setProjectModal(null);
          }}
          workspaceId={workspace._id}
          workspaceName={workspace.name}
          project={projectModal.project}
          mode={projectModal.mode}
        />
      )}
    </div>
  );
}
