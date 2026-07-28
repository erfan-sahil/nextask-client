import {
  CalendarDays,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import type { DashboardActivity } from "@/types/workspace";
import { cn } from "@/lib/utils";

type RecentActivityProps = {
  activity: DashboardActivity[];
};

const activityIcons = {
  TASK_ASSIGNED: CheckSquare,
  TASK_UPDATED: CheckSquare,
  TASK_COMMENT: MessageSquare,
  MENTION: MessageSquare,
  CHAT_MENTION: MessageSquare,
  MEETING_CREATED: CalendarDays,
  MEETING_UPDATED: CalendarDays,
} as const;

const activityTones = {
  TASK_ASSIGNED: "bg-primary-light text-primary",
  TASK_UPDATED: "bg-primary-light text-primary",
  TASK_COMMENT: "bg-chart-2/15 text-chart-2",
  MENTION: "bg-chart-2/15 text-chart-2",
  CHAT_MENTION: "bg-chart-2/15 text-chart-2",
  MEETING_CREATED: "bg-chart-3/15 text-chart-3",
  MEETING_UPDATED: "bg-chart-3/15 text-chart-3",
} as const;

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <section aria-label="Recent activity">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {activity.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No recent activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((item) => {
              const Icon = activityIcons[item.type];
              const content = (
                <>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      activityTones[item.type],
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6">{item.message}</p>
                    {item.task && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.task.title}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(undefined, {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(item.createdAt))}
                  </time>
                </>
              );

              return (
                <li key={item._id}>
                  {item.task ? (
                    <Link
                      href={appRoutes.board(
                        item.task.workspaceId.slug,
                        item.task.projectId._id,
                        item.task.boardId._id,
                      )}
                      className="flex gap-3 p-4 transition-colors hover:bg-muted/50"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex gap-3 p-4">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
