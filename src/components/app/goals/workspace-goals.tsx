"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Pencil,
  Plus,
  Rocket,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockGoals, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus, KeyResult, Workspace } from "@/types/workspace";

// ─── Status config ─────────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  ringClass: string;
  borderAccent: string;
  bgAccent: string;
};

const STATUS_CONFIG: Record<GoalStatus, StatusConfig> = {
  exceeding: {
    label: "Exceeding",
    icon: Rocket,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ringClass: "stroke-emerald-500",
    borderAccent: "border-l-emerald-500",
    bgAccent: "bg-emerald-500",
  },
  on_track: {
    label: "On Track",
    icon: TrendingUp,
    badgeClass: "border-primary/25 bg-primary/10 text-primary",
    ringClass: "stroke-primary",
    borderAccent: "border-l-primary",
    bgAccent: "bg-primary",
  },
  at_risk: {
    label: "At Risk",
    icon: AlertTriangle,
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ringClass: "stroke-amber-500",
    borderAccent: "border-l-amber-500",
    bgAccent: "bg-amber-500",
  },
  off_track: {
    label: "Off Track",
    icon: TrendingDown,
    badgeClass: "border-destructive/25 bg-destructive/10 text-destructive",
    ringClass: "stroke-destructive",
    borderAccent: "border-l-destructive",
    bgAccent: "bg-destructive",
  },
  achieved: {
    label: "Achieved",
    icon: Trophy,
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ringClass: "stroke-violet-500",
    borderAccent: "border-l-violet-500",
    bgAccent: "bg-violet-500",
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
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
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
    <div className="flex items-start gap-3 py-2.5">
      {isComplete ? (
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/40" />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className={cn("truncate text-xs font-medium", isComplete && "line-through text-muted-foreground/60")}>
            {kr.title}
          </p>
          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {kr.current.toLocaleString()}
            <span className="opacity-50">/{kr.target.toLocaleString()} {kr.unit}</span>
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              isComplete ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/60">{pct}% complete</p>
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

function GoalCard({
  goal,
  projectNames,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  projectNames: string[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const pct = goalProgress(goal);
  const cfg = STATUS_CONFIG[goal.status];
  const StatusIcon = cfg.icon;
  const isOverdue = new Date(goal.dueDate) < new Date() && goal.status !== "achieved";
  const completedKRs = goal.keyResults.filter(
    (kr) => (kr.target === 0 ? 100 : (kr.current / kr.target) * 100) >= 100,
  ).length;

  return (
    <div
      className={cn(
        "group rounded-2xl border border-border border-l-[3px] bg-card transition-all duration-200 hover:shadow-md hover:shadow-black/5",
        cfg.borderAccent,
      )}
    >
      {/* Card body */}
      <div className="flex items-start gap-4 p-5">
        {/* Progress ring */}
        <div className="relative shrink-0">
          <ProgressRing value={pct} size={52} strokeWidth={4} status={goal.status} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
            {pct}%
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug">{goal.title}</h3>
            <Badge
              variant="outline"
              className={cn("flex shrink-0 items-center gap-1 px-2 py-0 text-[11px] font-medium", cfg.badgeClass)}
            >
              <StatusIcon className="size-3" />
              {cfg.label}
            </Badge>
            {isOverdue && (
              <Badge
                variant="outline"
                className="shrink-0 border-destructive/30 bg-destructive/8 px-2 py-0 text-[11px] text-destructive"
              >
                Overdue
              </Badge>
            )}
          </div>

          <p className="mt-1.5 text-xs leading-5 text-muted-foreground line-clamp-2">
            {goal.description}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
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
              <span className="text-[11px] text-muted-foreground">{goal.ownerName}</span>
            </div>

            {/* Due date */}
            <span className={cn("text-[11px] text-muted-foreground", isOverdue && "text-destructive font-medium")}>
              Due{" "}
              {new Date(goal.dueDate + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            {/* Key results count */}
            {goal.keyResults.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {completedKRs}/{goal.keyResults.length} key results
              </span>
            )}

            {/* Linked projects */}
            {projectNames.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {projectNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Expand toggle */}
          {goal.keyResults.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              aria-label={expanded ? "Collapse key results" : "Expand key results"}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          )}

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="More options"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="gap-2 text-xs"
                onClick={() => onEdit(goal.id)}
              >
                <Pencil className="size-3.5" />
                Edit goal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs text-destructive focus:text-destructive"
                onClick={() => onDelete(goal.id)}
              >
                <Trash2 className="size-3.5" />
                Delete goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key results (expandable) */}
      {expanded && goal.keyResults.length > 0 && (
        <div className="border-t border-border/60 px-5 pb-4 pt-1">
          <p className="mb-0.5 mt-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Key Results
          </p>
          <div className="divide-y divide-border/40">
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
  { value: "all", label: "All Goals" },
  { value: "exceeding", label: "Exceeding" },
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "off_track", label: "Off Track" },
  { value: "achieved", label: "Achieved" },
];

const STAT_CONFIG: {
  status: GoalStatus;
  colorClass: string;
  bgClass: string;
}[] = [
  { status: "exceeding", colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500/10" },
  { status: "on_track", colorClass: "text-primary", bgClass: "bg-primary/10" },
  { status: "at_risk", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500/10" },
  { status: "off_track", colorClass: "text-destructive", bgClass: "bg-destructive/10" },
  { status: "achieved", colorClass: "text-violet-600 dark:text-violet-400", bgClass: "bg-violet-500/10" },
];

export function WorkspaceGoals({ workspace }: { workspace: Workspace }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [goals, setGoals] = useState(() => mockGoals.filter((g) => g.workspaceId === workspace.id));

  const filtered = useMemo(() => {
    if (statusFilter === "all") return goals;
    return goals.filter((g) => g.status === statusFilter);
  }, [goals, statusFilter]);

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of mockProjects) map[p.id] = p.name;
    return map;
  }, []);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: goals.length };
    for (const g of goals) {
      c[g.status] = (c[g.status] ?? 0) + 1;
    }
    return c;
  }, [goals]);

  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.round(goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length);
  }, [goals]);

  const overallStatus = useMemo((): GoalStatus => {
    if (avgProgress >= 90) return "exceeding";
    if (avgProgress >= 65) return "on_track";
    if (avgProgress >= 35) return "at_risk";
    return "off_track";
  }, [avgProgress]);

  const handleEdit = (id: string) => {
    // TODO: open edit modal/sheet
    console.log("Edit goal:", id);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track objectives and key results for{" "}
            <span className="font-medium text-foreground">{workspace.name}</span>
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" />
          New Goal
        </Button>
      </div>

      {/* ── Overview banner ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* Progress ring + summary */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <ProgressRing value={avgProgress} size={68} strokeWidth={5} status={overallStatus} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                {avgProgress}%
              </span>
            </div>
            <div>
              <p className="text-base font-bold leading-tight">
                {goals.length} goal{goals.length !== 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Overall workspace progress</p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-2 flex w-fit items-center gap-1 px-2 py-0 text-[11px] font-medium",
                  STATUS_CONFIG[overallStatus].badgeClass,
                )}
              >
                {(() => {
                  const Icon = STATUS_CONFIG[overallStatus].icon;
                  return <Icon className="size-3" />;
                })()}
                {STATUS_CONFIG[overallStatus].label}
              </Badge>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden h-14 w-px bg-border sm:block" />

          {/* Status breakdown */}
          <div className="flex flex-1 flex-wrap gap-4">
            {STAT_CONFIG.map(({ status, colorClass, bgClass }) => {
              const count = counts[status] ?? 0;
              const cfg = STATUS_CONFIG[status];
              const Icon = cfg.icon;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 transition-colors hover:bg-muted",
                    statusFilter === status && "bg-muted",
                  )}
                >
                  <div className={cn("flex size-8 items-center justify-center rounded-lg", bgClass, colorClass)}>
                    <Icon className="size-4" />
                  </div>
                  <p className="text-base font-bold tabular-nums">{count}</p>
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-1 self-start rounded-xl border border-border bg-card p-1">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {opt.label}
            {counts[opt.value] !== undefined && counts[opt.value] > 0 && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                  statusFilter === opt.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {counts[opt.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Goal list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Target className="size-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold">No goals found</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {statusFilter === "all"
              ? "Create your first goal to start tracking team progress."
              : `No goals with status "${STATUS_CONFIG[statusFilter as GoalStatus]?.label}" in this workspace.`}
          </p>
          {statusFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-xs"
              onClick={() => setStatusFilter("all")}
            >
              View all goals
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              projectNames={goal.projectIds.map((id) => projectMap[id] ?? id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
