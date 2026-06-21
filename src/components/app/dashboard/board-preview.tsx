import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Board, TaskPriority } from "@/types/workspace";

type BoardPreviewProps = {
  board: Board;
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-2/15 text-chart-2",
  high: "bg-destructive/10 text-destructive",
};

const columnTones: Record<string, string> = {
  backlog: "bg-muted",
  in_progress: "bg-primary-light text-primary",
  review: "bg-chart-4/15 text-chart-4",
  done: "bg-primary/10 text-primary",
};

export function BoardPreview({ board }: BoardPreviewProps) {
  return (
    <section id="boards" className="scroll-mt-24">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Board preview</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Kanban view for tasks moving through your workflow.
          </p>
        </div>
        <Button size="sm" className="rounded-full">
          Open full board
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-xl dark:shadow-primary/5">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {board.workspaceName}
            </p>
            <p className="text-lg font-semibold">{board.projectName}</p>
            <p className="text-sm text-muted-foreground">{board.name}</p>
          </div>
          <Badge variant="secondary" className="w-fit rounded-full">
            Kanban
          </Badge>
        </div>

        <div className="overflow-x-auto p-5">
          <div className="flex min-w-max gap-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="w-64 shrink-0 rounded-xl border border-border bg-background p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{column.title}</h4>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      columnTones[column.status],
                    )}
                  >
                    {column.tasks.length}
                  </span>
                </div>

                <ul id="tasks" className="space-y-2">
                  {column.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-5">{task.title}</p>
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-[0.65rem] font-semibold text-primary">
                          {task.assigneeInitials}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[0.65rem] font-medium capitalize",
                            priorityStyles[task.priority],
                          )}
                        >
                          {task.priority}
                        </span>
                        {task.commentCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="size-3" />
                            {task.commentCount}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
