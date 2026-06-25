"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/config/navigation";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

type WorkspaceSwitcherProps = {
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  className?: string;
};

export function WorkspaceSwitcher({
  workspaces = mockWorkspaces,
  activeWorkspaceId = workspaces[0]?.id,
  className,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  if (!activeWorkspace) return null;

  function handleSelect(workspace: Workspace) {
    router.push(appRoutes.workspace(workspace.slug));
    setIsOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            activeWorkspace.color,
          )}
        >
          {activeWorkspace.initials}
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
                const isActive = workspace.id === activeWorkspace.id;
                return (
                  <li key={workspace.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(workspace)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-bold",
                          workspace.color,
                        )}
                      >
                        {workspace.initials}
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
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 rounded-lg text-primary"
              >
                <Plus className="size-4" />
                Create workspace
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
