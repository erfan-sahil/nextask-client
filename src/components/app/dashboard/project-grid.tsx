import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/workspace";

type ProjectGridProps = {
  projects: Project[];
};

function formatDueDate(date: string | null) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <section id="projects" className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Projects</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Active initiatives across your current workspace.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden rounded-full sm:inline-flex"
        >
          New project
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project) => {
          const progress = Math.round(
            (project.completedTaskCount / project.taskCount) * 100,
          );

          return (
            <article
              key={project.id}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-sm transition-all hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg",
                project.color,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold">{project.name}</h4>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 rounded-full">
                  {project.memberCount} members
                </Badge>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progress</span>
                  <span>
                    {project.completedTaskCount}/{project.taskCount} tasks
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-background/80">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Due {formatDueDate(project.dueDate)}
                </p>
                <Link
                  href={appRoutes.workspaces}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  View boards
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
