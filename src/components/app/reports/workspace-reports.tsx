"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  FolderKanban,
  RefreshCw,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ReportPeriod,
  type WorkspaceReportParams,
  workflowApi,
} from "@/lib/api/workflow";
import { workflowQueryKeys } from "@/lib/api/query-keys";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: "last_week", label: "Last week" },
  { value: "last_month", label: "Last month" },
  { value: "last_three_months", label: "Last 3 months" },
  { value: "last_six_months", label: "Last 6 months" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

const PROJECT_COLORS = [
  "bg-primary",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const percent = max ? Math.round((value / max) * 100) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          className ?? "bg-primary",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  className,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  className: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={cn("flex size-10 items-center justify-center rounded-xl", className)}>
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ReportDateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  const selectedRange = {
    from: from ? new Date(`${from}T00:00:00`) : undefined,
    to: to ? new Date(`${to}T00:00:00`) : undefined,
  };
  const label =
    selectedRange.from && selectedRange.to
      ? `${format(selectedRange.from, "MMM d, yyyy")} – ${format(selectedRange.to, "MMM d, yyyy")}`
      : "Select date range";

  return (
    <Popover>
      <PopoverTrigger className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-input bg-background px-2.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className={cn(!selectedRange.from && "text-muted-foreground")}>{label}</span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={selectedRange}
          onSelect={(range) =>
            onChange({
              from: range?.from ? format(range.from, "yyyy-MM-dd") : "",
              to: range?.to ? format(range.to, "yyyy-MM-dd") : "",
            })
          }
          numberOfMonths={2}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-8">
      <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export function WorkspaceReports({ workspaceSlug }: { workspaceSlug: string }) {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<ReportPeriod>("last_month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  const workspacesQuery = useQuery({
    queryKey: ["workspaces", "reports"],
    queryFn: () => workflowApi.listWorkspaces({ limit: 100 }),
  });
  const workspace = workspacesQuery.data?.workspaces.find(
    (item) => item.slug === workspaceSlug,
  );
  const projectsQuery = useQuery({
    queryKey: ["projects", workspace?._id, "report-filter"],
    queryFn: () => workflowApi.listProjects({ workspaceId: workspace!._id, limit: 100 }),
    enabled: Boolean(workspace?._id),
  });

  const reportParams = useMemo<WorkspaceReportParams>(() => {
    if (period === "custom") {
      return {
        period,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(selectedProjectId !== "all" ? { projectIds: [selectedProjectId] } : {}),
      };
    }

    return {
      period,
      ...(selectedProjectId !== "all" ? { projectIds: [selectedProjectId] } : {}),
    };
  }, [from, period, selectedProjectId, to]);

  const reportQuery = useQuery({
    queryKey: [
      ...workflowQueryKeys.reports(workspace?._id ?? ""),
      reportParams,
    ],
    queryFn: () => workflowApi.getWorkspaceReport(workspace!._id, reportParams),
    enabled:
      Boolean(workspace?._id) &&
      (period !== "custom" || (Boolean(from) && Boolean(to))),
  });

  const report = reportQuery.data;
  const projects = report?.projectProgress ?? [];
  const filterProjects = projectsQuery.data?.projects ?? [];
  const members = report?.memberActivity ?? [];
  const completedProjects = projects.filter(
    (project) =>
      project.totalTasks > 0 && project.completedTasks === project.totalTasks,
  ).length;
  const selectedPeriodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? "Last month";
  const selectedProjectLabel =
    selectedProjectId === "all"
      ? "All"
      : filterProjects.find((project) => project._id === selectedProjectId)?.name ??
        "All";

  if (workspacesQuery.isPending) {
    return <LoadingState />;
  }

  if (workspacesQuery.isError || !workspace) {
    return (
      <div className="px-4 py-6 sm:px-8">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="text-lg font-semibold">Workspace unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t load this workspace. Check your access and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 w-full bg-primary" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BarChart3 className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Workspace analytics for{" "}
                  <span className="font-medium text-foreground">{workspace.name}</span>
                </p>
              </div>
            </div>
            <Button
              aria-label="Refresh report"
              size="icon-sm"
              variant="outline"
              onClick={() => {
                setPeriod("last_month");
                setFrom("");
                setTo("");
                setSelectedProjectId("all");
                queryClient.invalidateQueries({
                  queryKey: workflowQueryKeys.reports(workspace?._id ?? ""),
                });
              }}
              disabled={reportQuery.isFetching}
            >
              <RefreshCw className={cn(reportQuery.isFetching && "animate-spin")} />
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <label className="grid w-48 gap-1.5 text-xs font-medium text-muted-foreground">
              Time period
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as ReportPeriod)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue className="truncate">{selectedPeriodLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start" side="bottom">
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="grid w-52 min-w-0 gap-1.5 text-xs font-medium text-muted-foreground">
              Projects
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue className="truncate">{selectedProjectLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start" side="bottom">
                  <SelectItem value="all">All projects</SelectItem>
                  {filterProjects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {period === "custom" && (
              <div className="grid w-80 max-w-full basis-full gap-1.5 text-xs font-medium text-muted-foreground xl:basis-auto">
                Date range
                <ReportDateRangePicker
                  from={from}
                  to={to}
                  onChange={({ from: nextFrom, to: nextTo }) => {
                    setFrom(nextFrom);
                    setTo(nextTo);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {period === "custom" && (!from || !to) ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Clock className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Select a custom date range</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Both dates are required before the report can be generated.
          </p>
        </div>
      ) : reportQuery.isPending ? (
        <LoadingState />
      ) : reportQuery.isError || !report ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">Unable to load report</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try refreshing the report or check that you have analytics access.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total tasks"
              value={report.overview.totalTasks}
              icon={BarChart3}
              className="bg-primary/10 text-primary"
              subtitle={`Across ${projects.length} project${projects.length === 1 ? "" : "s"}`}
            />
            <StatCard
              label="Completed"
              value={report.overview.completedTasks}
              icon={CheckCircle2}
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              subtitle={`${report.overview.completionRate}% complete`}
            />
            <StatCard
              label="Open tasks"
              value={report.overview.openTasks}
              icon={Clock}
              className="bg-chart-2/10 text-chart-2"
              subtitle={`${report.overview.overdueTasks} overdue`}
            />
            <StatCard
              label="On-time completion"
              value={`${report.overview.onTimeCompletionRate}%`}
              icon={Target}
              className="bg-chart-3/10 text-chart-3"
              subtitle={`${report.overview.completedOnTimeInPeriod} completed on time`}
            />
          </div>

          {report.overview.overdueTasks > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  {report.overview.overdueTasks} overdue task
                  {report.overview.overdueTasks === 1 ? "" : "s"} need attention
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  These tasks have a passed due date and are not yet completed.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4">
                <FolderKanban className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Project progress</h2>
                <span className="ml-auto text-xs text-muted-foreground">{projects.length}</span>
              </header>
              <div className="max-h-105 space-y-5 overflow-y-auto p-5 pr-3">
                {projects.length ? (
                  projects.map((item, index) => {
                    const overdue =
                      item.project.endDate &&
                      new Date(item.project.endDate) < new Date() &&
                      item.project.status !== "COMPLETED";
                    const complete = item.completionRate === 100;
                    return (
                      <div key={item.project._id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={cn(
                                "flex size-6 shrink-0 items-center justify-center rounded-lg text-[0.6rem] font-bold text-white",
                                PROJECT_COLORS[index % PROJECT_COLORS.length],
                              )}
                            >
                              {item.project.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate text-sm font-medium">{item.project.name}</span>
                            {overdue && <Badge variant="destructive">Overdue</Badge>}
                            {complete && <Badge variant="secondary">Done</Badge>}
                          </div>
                          <span className="text-sm font-semibold">{item.completionRate}%</span>
                        </div>
                        <ProgressBar
                          value={item.completedTasks}
                          max={item.totalTasks}
                          className={PROJECT_COLORS[index % PROJECT_COLORS.length]}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {item.completedTasks}/{item.totalTasks} tasks · {item.completedInPeriod} completed
                          in this period
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No projects match this filter.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Zap className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Member activity</h2>
                <span className="ml-auto text-xs text-muted-foreground">{members.length}</span>
              </header>
              <div className="max-h-105 space-y-3 overflow-y-auto p-5 pr-3">
                {members.length ? (
                  members.map((item) => {
                    const name = `${item.member.firstName} ${item.member.lastName}`.trim();
                    const initials = `${item.member.firstName[0] ?? ""}${item.member.lastName[0] ?? ""}`;
                    return (
                      <div key={item.member._id} className="rounded-xl border border-border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.completedInPeriod} completed this period ·{" "}
                              {item.onTimeCompletionRate}% on time
                            </p>
                          </div>
                          <span className="text-sm font-semibold">{item.assignedTasks}</span>
                        </div>
                        <div className="mt-3">
                          <ProgressBar
                            value={item.completedInPeriod}
                            max={item.assignedTasks}
                            className="bg-primary"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <Users className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No member activity for these projects.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  <p className="text-sm font-semibold">Overall completion</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {report.overview.completedTasks} of {report.overview.totalTasks} tasks completed ·{" "}
                  {completedProjects} of {projects.length} projects finished
                </p>
              </div>
              <span className="text-3xl font-bold text-primary">
                {report.overview.completionRate}%
              </span>
            </div>
            <ProgressBar
              value={report.overview.completedTasks}
              max={report.overview.totalTasks}
            />
          </section>
        </>
      )}
    </div>
  );
}
