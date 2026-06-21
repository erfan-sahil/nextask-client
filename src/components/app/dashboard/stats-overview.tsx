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
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {stats[item.key]}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    item.tone,
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
