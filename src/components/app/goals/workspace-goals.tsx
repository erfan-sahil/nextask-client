"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockGoals, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus, KeyResult, Workspace } from "@/types/workspace";

// ─── Status config ─────────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  ringClass: string;
  dotClass: string;
};

const STATUS_CONFIG: Record<GoalStatus, StatusConfig> = {
  on_track: {
    label: "On Track",
    icon: TrendingUp,
    badgeClass: "border-primary/25 bg-primary/10 text-primary",
    ringClass: "stroke-primary",
    dotClass: "bg-primary",
  },
  at_risk: {
    label: "At Risk",
    icon: AlertTriangle,
    badgeClass: "border-yellow-500/25 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    ringClass: "stroke-yellow-500",
    dotClass: "bg-yellow-500",
  },
  off_track: {
    label: "Off Track",
    icon: TrendingDown,
    badgeClass: "border-destructive/25 bg-destructive/10 text-destructive",
    ringClass: "stroke-destructive",
    dotClass: "bg-destructive",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass: "border-chart-3/25 bg-chart-3/10 text-chart-3",
    ringClass: "stroke-chart-3",
    dotClass: "bg-chart-3",
  },
};

// ─── Progress ring ─────────────────────────────────────────────────────────

function ProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  status,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  status: GoalStatus;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const cfg = STATUS_CONFIG[status];

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-muted"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn("transition-all duration-500", cfg.ringClass)}
      />
    </svg>
  );
}

// ─── Key result row ─────────────────────────────────────────────────────────

function KeyResultRow({ kr }: { kr: KeyResult }) {
  const pct = kr.target === 0 ? 100 : Math.min(100, Math.round((kr.current / kr.target) * 100));
  const isComplete = pct >= 100;

  return (
    <div className="flex items-center gap-3 py-2">
      {isComplete ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
      ) : (
        <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className={cn("truncate text-xs font-medium", isComplete && "line-through text-muted-foreground")}>
            {kr.title}
          </p>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {kr.current.toLocaleString()}/{kr.target.toLocaleString()}{" "}
            <span className="opacity-70">{kr.unit}</span>
          </span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-primary" : "bg-primary/60",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Goal card ─────────────────────────────────────────────────────────────

function goalProgress(goal: Goal): number {
  if (goal.keyResults.length === 0) return 0;
  const total = goal.keyResults.reduce((sum, kr) => {
    const pct = kr.target === 0 ? 100 : Math.min(100, (kr.current / kr.target) * 100);
    return sum + pct;
  }, 0);
  return Math.round(total / goal.keyResults.length);
}

function GoalCard({ goal, projectNames }: { goal: Goal; projectNames: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const pct = goalProgress(goal);
  const cfg = STATUS_CONFIG[goal.status];
  const StatusIcon = cfg.icon;
  const isOverdue = new Date(goal.dueDate) < new Date() && goal.status !== "completed";

  return (
    <div className="rounded-2xl border border-border bg-card transition-shadow hover:shadow-sm">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        {/* Progress ring */}
        <div className="relative shrink-0">
          <ProgressRing value={pct} status={goal.status} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
            {pct}%
          </span>
        </div>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-sm font-semibold leading-snug">{goal.title}</h3>
            <Badge
              variant="outline"
              className={cn("flex shrink-0 items-center gap-1 px-2 py-0 text-[11px] font-medium", cfg.badgeClass)}
            >
              <StatusIcon className="size-3" />
              {cfg.label}
            </Badge>
            {isOverdue && (
              <Badge variant="outline" className="shrink-0 border-destructive/25 px-2 py-0 text-[11px] text-destructive">
                Overdue
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
            {goal.description}
          </p>

          {/* Footer meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {/* Owner */}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[9px] font-bold",
                  goal.ownerColor,
                )}
              >
                {goal.ownerInitials}
              </div>
              <span className="text-xs text-muted-foreground">{goal.ownerName}</span>
            </div>

            {/* Due date */}
            <span className={cn("text-xs text-muted-foreground", isOverdue && "text-destructive")}>
              Due{" "}
              {new Date(goal.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            {/* Linked projects */}
            {projectNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {projectNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Key results count */}
            <span className="ml-auto text-xs text-muted-foreground">
              {goal.keyResults.length} key result{goal.keyResults.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={expanded ? "Collapse key results" : "Expand key results"}
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
      </div>

      {/* Key results (expandable) */}
      {expanded && goal.keyResults.length > 0 && (
        <div className="border-t border-border px-5 pb-4 pt-1">
          <p className="mb-1 mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Key Results
          </p>
          <div className="divide-y divide-border/50">
            {goal.keyResults.map((kr) => (
              <KeyResultRow key={kr.id} kr={kr} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

type StatusFilter = GoalStatus | "all";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "off_track", label: "Off Track" },
  { value: "completed", label: "Completed" },
];

export function WorkspaceGoals({ workspace }: { workspace: Workspace }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const wsGoals = useMemo(
    () => mockGoals.filter((g) => g.workspaceId === workspace.id),
    [workspace.id],
  );

  const filtered = useMemo(() => {
    if (statusFilter === "all") return wsGoals;
    return wsGoals.filter((g) => g.status === statusFilter);
  }, [wsGoals, statusFilter]);

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of mockProjects) map[p.id] = p.name;
    return map;
  }, []);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: wsGoals.length };
    for (const g of wsGoals) {
      c[g.status] = (c[g.status] ?? 0) + 1;
    }
    return c;
  }, [wsGoals]);

  const avgProgress = useMemo(() => {
    if (wsGoals.length === 0) return 0;
    return Math.round(wsGoals.reduce((s, g) => s + goalProgress(g), 0) / wsGoals.length);
  }, [wsGoals]);

  const STAT_CARDS: {
    label: string;
    value: number;
    icon: React.ElementType;
    status?: GoalStatus;
    colorClass: string;
  }[] = [
    { label: "On Track", value: counts.on_track ?? 0, icon: TrendingUp, status: "on_track", colorClass: "bg-primary/10 text-primary" },
    { label: "At Risk", value: counts.at_risk ?? 0, icon: AlertTriangle, status: "at_risk", colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
    { label: "Off Track", value: counts.off_track ?? 0, icon: XCircle, status: "off_track", colorClass: "bg-destructive/10 text-destructive" },
    { label: "Completed", value: counts.completed ?? 0, icon: CheckCircle2, status: "completed", colorClass: "bg-chart-3/10 text-chart-3" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track objectives and key results for{" "}
            <span className="font-medium text-foreground">{workspace.name}</span>
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          New goal
        </Button>
      </div>

      {/* Overview banner */}
      <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <div className="relative shrink-0">
          <ProgressRing value={avgProgress} size={64} strokeWidth={5} status={avgProgress >= 70 ? "on_track" : avgProgress >= 40 ? "at_risk" : "off_track"} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
            {avgProgress}%
          </span>
        </div>
        <div>
          <p className="text-lg font-bold">
            {wsGoals.length} goal{wsGoals.length !== 1 ? "s" : ""} total
          </p>
          <p className="text-sm text-muted-foreground">
            Average progress across all goals in this workspace
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-4">
          {STAT_CARDS.map((card) => {
            const CardIcon = card.icon;
            return (
              <div key={card.label} className="text-center">
                <div className={cn("mx-auto mb-1 flex size-8 items-center justify-center rounded-lg", card.colorClass)}>
                  <CardIcon className="size-4" />
                </div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-[11px] text-muted-foreground">{card.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 self-start">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
            {counts[opt.value] !== undefined && (
              <span className="ml-1.5 opacity-70">{counts[opt.value]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Goal list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Target className="mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm font-medium">No goals found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {statusFilter === "all"
              ? "Create your first goal to start tracking progress."
              : `No goals with status "${STATUS_CONFIG[statusFilter as GoalStatus]?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              projectNames={goal.projectIds.map((id) => projectMap[id] ?? id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
