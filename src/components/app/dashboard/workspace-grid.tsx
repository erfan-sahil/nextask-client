import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

type WorkspaceGridProps = {
  workspaces: Workspace[];
};

export function WorkspaceGrid({ workspaces }: WorkspaceGridProps) {
  return (
    <section id="workspaces" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Workspaces</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Dedicated spaces for each team with their own projects and boards.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden rounded-full sm:inline-flex"
        >
          New workspace
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => (
          <article
            key={workspace.id}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  workspace.color,
                )}
              >
                {workspace.initials}
              </span>
              <Badge variant="secondary" className="rounded-full">
                <Users data-icon="inline-start" className="size-3" />
                {workspace.memberCount}
              </Badge>
            </div>

            <h4 className="mt-4 text-base font-semibold">{workspace.name}</h4>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {workspace.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                {workspace.projectCount} active projects
              </p>
              <Link
                href={appRoutes.workspace(workspace.slug)}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
