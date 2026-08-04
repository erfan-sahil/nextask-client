"use client";

import { ChevronDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WorkspaceModal } from "@/components/app/workspaces/workspace-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { WorkspaceDoc } from "@/types/domain";

type WorkspaceSwitcherProps = {
  workspaces: WorkspaceDoc[];
  activeWorkspaceId?: string;
  className?: string;
  isLoading?: boolean;
};

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId = workspaces[0]?._id,
  className,
  isLoading = false,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [workspaceAction, setWorkspaceAction] = useState<{
    mode: "edit" | "delete";
    workspace: WorkspaceDoc;
  } | null>(null);
  const activeWorkspace =
    workspaces.find((workspace) => workspace._id === activeWorkspaceId) ??
    workspaces[0];

  if (!activeWorkspace) {
    return (
      <>
        <div
          className={cn(
            "rounded-xl border border-sidebar-border px-3 py-2.5 text-sm text-muted-foreground",
            className,
          )}
        >
          {isLoading ? "Loading workspaces…" : "No workspaces yet"}
          {!isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateWorkspaceModalOpen(true)}
              className="mt-2 w-full justify-start gap-2 rounded-lg text-primary"
            >
              <Plus className="size-4" />
              Create workspace
            </Button>
          )}
        </div>
        <WorkspaceModal
          isOpen={isCreateWorkspaceModalOpen}
          onOpenChange={setIsCreateWorkspaceModalOpen}
          mode="create"
          onCreated={handleWorkspaceCreated}
        />
      </>
    );
  }

  function handleSelect(workspace: WorkspaceDoc) {
    router.push(appRoutes.workspace(workspace.slug));
    setIsOpen(false);
  }

  function handleWorkspaceCreated(workspace: WorkspaceDoc) {
    setIsOpen(false);
    router.push(appRoutes.workspace(workspace.slug));
  }

  function handleWorkspaceDeleted(workspace: WorkspaceDoc) {
    setWorkspaceAction(null);
    setIsOpen(false);
    if (workspace._id === activeWorkspace._id) {
      router.push(appRoutes.workspaces);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar px-3 py-2.5 text-left transition-colors hover:bg-emerald-500/5"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            "bg-primary/15 text-primary",
          )}
        >
          {activeWorkspace.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-sidebar-foreground">
            {activeWorkspace.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {activeWorkspace.projectCount} projects
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close workspace menu"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-sidebar-border bg-popover shadow-lg"
            role="listbox"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Switch workspace
              </p>
            </div>
            <ul className="max-h-56 overflow-y-auto p-1.5">
              {workspaces.map((workspace) => {
                const isActive = workspace._id === activeWorkspace._id;
                return (
                  <li
                    key={workspace._id}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-emerald-500/5",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(workspace)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-bold",
                          "bg-primary/15 text-primary",
                        )}
                      >
                        {workspace.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {workspace.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {workspace.memberCount} members
                        </span>
                      </span>
                      {isActive && (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Manage ${workspace.name}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="whitespace-nowrap"
                          onClick={() => setWorkspaceAction({ mode: "edit", workspace })}
                        >
                          <Pencil />
                          Edit workspace
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          className="whitespace-nowrap"
                          onClick={() => setWorkspaceAction({ mode: "delete", workspace })}
                        >
                          <Trash2 />
                          Delete workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border p-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateWorkspaceModalOpen(true)}
                className="w-full justify-start gap-2 rounded-lg text-primary"
              >
                <Plus className="size-4" />
                Create workspace
              </Button>
            </div>
          </div>
        </>
      )}
      <WorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onOpenChange={setIsCreateWorkspaceModalOpen}
        mode="create"
        onCreated={handleWorkspaceCreated}
      />
      <WorkspaceModal
        key={
          workspaceAction
            ? `${workspaceAction.mode}-${workspaceAction.workspace._id}`
            : "workspace-action"
        }
        isOpen={workspaceAction !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setWorkspaceAction(null);
        }}
        mode={workspaceAction?.mode ?? "edit"}
        workspace={workspaceAction?.workspace}
        onDeleted={handleWorkspaceDeleted}
      />
    </div>
  );
}
