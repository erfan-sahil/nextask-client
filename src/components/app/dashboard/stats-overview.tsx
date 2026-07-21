import {
  CalendarClock,
  CheckSquare,
  FolderKanban,
  Users,
} from "lucide-react";
import type { DashboardStats } from "@/types/workspace";
import { cn } from "@/lib/utils";

type StatsOverviewProps = {
  stats: DashboardStats;
};

const statItems = [
  {
    key: "activeProjects" as const,
    label: "Active projects",
    icon: FolderKanban,
    tone: "bg-primary-light text-primary",
  },
  {
    key: "openTasks" as const,
    label: "Open tasks",
    icon: CheckSquare,
    tone: "bg-chart-2/15 text-chart-2",
  },
  {
    key: "dueThisWeek" as const,
    label: "Due this week",
    icon: CalendarClock,
    tone: "bg-chart-4/15 text-chart-4",
  },
  {
    key: "teamMembers" as const,
    label: "Team members",
    icon: Users,
    tone: "bg-chart-3/15 text-chart-3",
  },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <section aria-label="Overview statistics">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.key}
              className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    item.tone,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">
                    {stats[item.key]}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
