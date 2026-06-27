"use client";

import { BarChart3, CheckCircle2, Clock, FolderKanban, TrendingUp, Users, Zap } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { mockMembers, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconClassName?: string;
  trend?: string;
};

function StatCard({ label, value, icon: Icon, iconClassName, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", iconClassName ?? "bg-primary/10")}>
          <Icon className={cn("size-5", iconClassName ? "text-white" : "text-primary")} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <TrendingUp className="size-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", className ?? "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function WorkspaceReports({ workspace }: { workspace: Workspace }) {
  const wsProjects = useMemo(
    () => mockProjects.filter((p) => p.workspaceId === workspace.id),
    [workspace.id],
  );

  const wsMembers = useMemo(
    () => mockMembers.filter((m) => m.workspaceId === workspace.id),
    [workspace.id],
  );

  const totalTasks = wsProjects.reduce((s, p) => s + p.taskCount, 0);
  const completedTasks = wsProjects.reduce((s, p) => s + p.completedTaskCount, 0);
  const inProgressTasks = totalTasks - completedTasks;
  const overallCompletion = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const PROJECT_COLORS = [
    "bg-primary",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
  ];

  const isOverdue = (dueDate: string | null) =>
    dueDate ? new Date(dueDate) < new Date() : false;

  const overdueProjects = wsProjects.filter((p) => isOverdue(p.dueDate));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Workspace analytics for{" "}
          <span className="font-medium text-foreground">{workspace.name}</span>
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={totalTasks}
          icon={BarChart3}
          iconClassName="bg-primary/10"
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          iconClassName="bg-primary/10"
          trend={`${overallCompletion}%`}
        />
        <StatCard
          label="In progress"
          value={inProgressTasks}
          icon={Clock}
          iconClassName="bg-chart-2/10"
        />
        <StatCard
          label="Team members"
          value={wsMembers.length}
          icon={Users}
          iconClassName="bg-chart-3/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project progress */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center gap-2">
            <FolderKanban className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Project progress</h2>
          </div>
          {wsProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects in this workspace.</p>
          ) : (
            <div className="space-y-5">
              {wsProjects.map((project, idx) => {
                const pct =
                  project.taskCount === 0
                    ? 0
                    : Math.round((project.completedTaskCount / project.taskCount) * 100);
                const overdue = isOverdue(project.dueDate);
                const barColor = PROJECT_COLORS[idx % PROJECT_COLORS.length];

                return (
                  <div key={project.id}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded text-[0.6rem] font-bold text-white",
                            barColor,
                          )}
                        >
                          {project.name[0].toUpperCase()}
                        </span>
                        <span className="truncate text-sm font-medium">{project.name}</span>
                        {overdue && (
                          <Badge variant="outline" className="shrink-0 border-destructive/30 px-1.5 py-0 text-[10px] text-destructive">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{pct}%</span>
                    </div>
                    <ProgressBar value={project.completedTaskCount} max={project.taskCount} className={barColor} />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {project.completedTaskCount}/{project.taskCount} tasks
                      {project.dueDate && (
                        <span className={cn("ml-2", overdue && "text-destructive")}>
                          · Due {new Date(project.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Member activity */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Member breakdown</h2>
          </div>
          {wsMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members in this workspace.</p>
          ) : (
            <div className="space-y-3">
              {wsMembers.map((member) => {
                const memberProjects = wsProjects.filter((p) =>
                  member.projectIds.includes(p.id),
                );
                const memberTasks = memberProjects.reduce((s, p) => s + p.taskCount, 0);

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5"
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        member.avatarColor,
                      )}
                    >
                      {member.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        <span className="shrink-0 text-[10px] capitalize text-muted-foreground">
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {memberProjects.length} project{memberProjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{memberTasks}</p>
                      <p className="text-[10px] text-muted-foreground">tasks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overall completion banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Overall workspace completion</p>
            <p className="text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed across all projects
            </p>
          </div>
          <span className="text-3xl font-bold text-primary">{overallCompletion}%</span>
        </div>
        <ProgressBar value={completedTasks} max={totalTasks} className="bg-primary" />
      </div>
    </div>
  );
}
