"use client";

import { CalendarClock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import type { DashboardTask } from "@/types/workspace";

type DashboardTaskListProps = {
  title: string;
  emptyMessage: string;
  tasks: DashboardTask[];
};

function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "No due date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(dueDate));
}

export function DashboardTaskList({
  title,
  emptyMessage,
  tasks,
}: DashboardTaskListProps) {
  return (
    <section aria-label={title}>
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="size-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {tasks.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <li key={task._id}>
                <Link
                  href={appRoutes.board(
                    task.workspace.slug,
                    task.project._id,
                    task.board._id,
                  )}
                  className="block p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {task.project.name} · {task.board.name}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {task.status?.name ?? "Unscheduled"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" aria-hidden />
                    Due {formatDueDate(task.dueDate)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
