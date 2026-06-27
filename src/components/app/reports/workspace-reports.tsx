"use client";

import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FolderKanban,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockMembers, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

// ─── Stat chip (matches workspace-page & members pattern) ────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
  colorClass = "bg-muted text-muted-foreground",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── Stat card (analytics grid) ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary",
  trend,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass?: string;
  trend?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <TrendingUp className="size-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      {subtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground/70">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all duration-500", className ?? "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PROJECT_COLORS = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

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

  const isOverdue = (dueDate: string | null) =>
    dueDate ? new Date(dueDate) < new Date() : false;

  const overdueProjects = wsProjects.filter((p) => isOverdue(p.dueDate));
  const completedProjects = wsProjects.filter(
    (p) => p.taskCount > 0 && p.completedTaskCount === p.taskCount,
  );

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      {/* ── Header card ── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 w-full bg-primary" />
        <div className="p-6">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Workspace analytics for{" "}
                  <span className="font-medium text-foreground">{workspace.name}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-2">
              <Download className="size-4" />
              <span className="hidden sm:inline">Export report</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-3">
            <StatChip
              icon={FolderKanban}
              label="Projects"
              value={wsProjects.length}
              colorClass="bg-primary/10 text-primary"
            />
            <StatChip
              icon={Users}
              label="Members"
              value={wsMembers.length}
              colorClass="bg-chart-3/10 text-chart-3"
            />
            <StatChip
              icon={CheckCircle2}
              label="Completed tasks"
              value={completedTasks}
              colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatChip
              icon={Target}
              label="Completion rate"
              value={`${overallCompletion}%`}
              colorClass={
                overallCompletion >= 75
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-primary/10 text-primary"
              }
            />
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={totalTasks}
          icon={BarChart3}
          subtitle={`Across ${wsProjects.length} project${wsProjects.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          icon={CheckCircle2}
          colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          trend={`${overallCompletion}%`}
        />
        <StatCard
          label="In progress"
          value={inProgressTasks}
          icon={Clock}
          colorClass="bg-chart-2/10 text-chart-2"
        />
        <StatCard
          label="Team members"
          value={wsMembers.length}
          icon={Users}
          colorClass="bg-chart-3/10 text-chart-3"
        />
      </div>

      {/* ── Overdue alert ── */}
      {overdueProjects.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              {overdueProjects.length} overdue project{overdueProjects.length > 1 ? "s" : ""}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {overdueProjects.map((p) => p.name).join(", ")}{" "}
              {overdueProjects.length > 1 ? "are" : "is"} past the due date and need attention.
            </p>
          </div>
        </div>
      )}

      {/* ── Two-column panels ── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Project progress */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <FolderKanban className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Project progress</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {wsProjects.length}
            </span>
          </div>

          <div className="p-5">
            {wsProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <FolderKanban className="size-5 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Create a project to start tracking progress.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {wsProjects.map((project, idx) => {
                  const pct =
                    project.taskCount === 0
                      ? 0
                      : Math.round((project.completedTaskCount / project.taskCount) * 100);
                  const overdue = isOverdue(project.dueDate);
                  const isComplete = pct === 100;
                  const barColor = PROJECT_COLORS[idx % PROJECT_COLORS.length];

                  return (
                    <div key={project.id}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded-lg text-[0.6rem] font-bold text-white",
                              barColor,
                            )}
                          >
                            {project.name[0].toUpperCase()}
                          </span>
                          <span className="truncate text-sm font-medium">{project.name}</span>
                          {overdue && !isComplete && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-destructive/30 px-1.5 py-0 text-[10px] text-destructive"
                            >
                              Overdue
                            </Badge>
                          )}
                          {isComplete && (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-emerald-500/30 px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400"
                            >
                              Done
                            </Badge>
                          )}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-sm font-semibold",
                            isComplete
                              ? "text-emerald-600 dark:text-emerald-400"
                              : overdue
                                ? "text-destructive"
                                : "text-foreground",
                          )}
                        >
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar
                        value={project.completedTaskCount}
                        max={project.taskCount}
                        className={cn(
                          isComplete ? "bg-emerald-500" : overdue ? "bg-destructive" : barColor,
                        )}
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {project.completedTaskCount}/{project.taskCount} tasks
                        {project.dueDate && (
                          <span className={cn("ml-2", overdue && !isComplete && "text-destructive")}>
                            · Due{" "}
                            {new Date(project.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Member breakdown */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Zap className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Member breakdown</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {wsMembers.length}
            </span>
          </div>

          <div className="p-5">
            {wsMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <Users className="size-5 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No members yet</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Invite team members to see their activity here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {wsMembers.map((member) => {
                  const memberProjects = wsProjects.filter((p) =>
                    member.projectIds.includes(p.id),
                  );
                  const memberTasks = memberProjects.reduce((s, p) => s + p.taskCount, 0);
                  const memberCompleted = memberProjects.reduce(
                    (s, p) => s + p.completedTaskCount,
                    0,
                  );
                  const memberPct =
                    memberTasks === 0 ? 0 : Math.round((memberCompleted / memberTasks) * 100);

                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5">
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
                            <p className="truncate text-sm font-medium leading-snug">
                              {member.name}
                            </p>
                            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {memberProjects.length} project
                            {memberProjects.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold">{memberTasks}</p>
                          <p className="text-[10px] text-muted-foreground">tasks</p>
                        </div>
                      </div>
                      {memberTasks > 0 && (
                        <div className="px-3 pb-3">
                          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>
                              {memberCompleted}/{memberTasks} completed
                            </span>
                            <span className="font-medium">{memberPct}%</span>
                          </div>
                          <ProgressBar value={memberCompleted} max={memberTasks} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Overall completion banner ── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <p className="text-sm font-semibold">Overall workspace completion</p>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed ·{" "}
              {completedProjects.length} of {wsProjects.length} projects finished
            </p>
          </div>
          <span className="text-3xl font-bold text-primary">{overallCompletion}%</span>
        </div>
        <ProgressBar value={completedTasks} max={totalTasks} />
        <div className="mt-3 flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-primary" />
            Completed ({completedTasks})
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-muted-foreground/40" />
            Remaining ({inProgressTasks})
          </span>
          {overdueProjects.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3" />
              {overdueProjects.length} overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
