import {
  CheckSquare,
  Columns3,
  FolderKanban,
  MessageSquare,
} from "lucide-react";
import type { ActivityItem } from "@/types/workspace";
import { cn } from "@/lib/utils";

type RecentActivityProps = {
  activity: ActivityItem[];
};

const activityIcons = {
  task: CheckSquare,
  comment: MessageSquare,
  project: FolderKanban,
  board: Columns3,
} as const;

const activityTones = {
  task: "bg-primary-light text-primary",
  comment: "bg-chart-2/15 text-chart-2",
  project: "bg-chart-3/15 text-chart-3",
  board: "bg-chart-4/15 text-chart-4",
} as const;

export function RecentActivity({ activity }: RecentActivityProps) {
  return (
    <section aria-label="Recent activity">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <ul className="divide-y divide-border">
          {activity.map((item) => {
            const Icon = activityIcons[item.type];

            return (
              <li key={item.id} className="flex gap-3 p-4">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    activityTones[item.type],
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6">
                    <span className="font-semibold">{item.userName}</span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-primary">{item.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.context}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {item.createdAt}
                </time>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
