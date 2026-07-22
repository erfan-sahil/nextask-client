"use client";

import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CirclePause,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGoals, useWorkspaceBySlug } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
import type {
  GoalDoc,
  GoalPriority,
  GoalStatus,
} from "@/types/domain";

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
  PLANNING: {
    label: "Planning",
    icon: CircleDashed,
    badgeClass:
      "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    ringClass: "stroke-purple-500",
    borderAccent: "border-l-purple-500",
    bgAccent: "bg-purple-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    badgeClass:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ringClass: "stroke-blue-500",
    borderAccent: "border-l-blue-500",
    bgAccent: "bg-blue-500",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: CirclePause,
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ringClass: "stroke-amber-500",
    borderAccent: "border-l-amber-500",
    bgAccent: "bg-amber-500",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ringClass: "stroke-emerald-500",
    borderAccent: "border-l-emerald-500",
    bgAccent: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    badgeClass:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    ringClass: "stroke-red-500",
    borderAccent: "border-l-red-500",
    bgAccent: "bg-red-500",
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

// ─── Goal card ─────────────────────────────────────────────────────────────

function goalProgress(goal: GoalDoc): number {
  return goal.status === "COMPLETED" ? 100 : 0;
}

function GoalCard({
  goal,
  canManage,
  onViewDetails,
  onEdit,
  onDelete,
}: {
  goal: GoalDoc;
  canManage: boolean;
  onViewDetails: (goal: GoalDoc) => void;
  onEdit: (goal: GoalDoc) => void;
  onDelete: (id: string) => void;
}) {
  const pct = goalProgress(goal);
  const cfg = STATUS_CONFIG[goal.status];
  const StatusIcon = cfg.icon;
  const isOverdue =
    goal.dueDate !== null &&
    new Date(goal.dueDate) < new Date() &&
    goal.status !== "COMPLETED" &&
    goal.status !== "CANCELLED";
  const ownerName =
    `${goal.createdBy.firstName} ${goal.createdBy.lastName}`.trim() ||
    goal.createdBy.username ||
    goal.createdBy.email;
  const ownerInitials = ownerName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <ProgressRing
            value={pct}
            size={52}
            strokeWidth={4}
            status={goal.status}
          />
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
              className={cn(
                "flex shrink-0 items-center gap-1 px-2 py-0 text-[11px] font-medium",
                cfg.badgeClass,
              )}
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
                className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary"
              >
                {ownerInitials}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {ownerName}
              </span>
            </div>

            {/* Due date */}
            {goal.dueDate && (
              <span
                className={cn(
                  "text-[11px] text-muted-foreground",
                  isOverdue && "font-medium text-destructive",
                )}
              >
                Due{" "}
                {new Date(goal.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="More options"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="gap-2 text-xs" onClick={() => onViewDetails(goal)}>
                <Eye className="size-3.5" />
                View details
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-xs" onClick={() => onEdit(goal)}>
                    <Pencil className="size-3.5" />
                    Edit goal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-xs text-destructive focus:text-destructive"
                    onClick={() => onDelete(goal._id)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete goal
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

const GOAL_STATUSES: GoalStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
];
const GOAL_PRIORITIES: GoalPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const EMPTY_GOALS: GoalDoc[] = [];

const toDateInputValue = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

function GoalDatePicker({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger
          id={id}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <span>{selectedDate ? format(selectedDate, "PPP") : "Select a date"}</span>
          <CalendarDays className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
            captionLayout="dropdown"
          />
          {selectedDate && (
            <div className="border-t border-border p-2">
              <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => onChange("")}>
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ExpandableDescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="goal-description">Description</Label>
      <Textarea
        id="goal-description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => {
          const textarea = event.currentTarget;
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
        }}
        maxLength={10000}
        rows={3}
        placeholder="Describe the goal"
        className="min-h-24 resize-none overflow-hidden"
      />
    </div>
  );
}

function GoalDialog({
  goal,
  workspaceId,
  onClose,
}: {
  goal: GoalDoc | null;
  workspaceId: string;
  onClose: () => void;
}) {
  const goals = useGoals(workspaceId);
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? "PLANNING");
  const [priority, setPriority] = useState<GoalPriority>(
    goal?.priority ?? "MEDIUM",
  );
  const [startDate, setStartDate] = useState(toDateInputValue(goal?.startDate ?? null));
  const [dueDate, setDueDate] = useState(toDateInputValue(goal?.dueDate ?? null));
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(goal);
  const isPending = goals.create.isPending || goals.update.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        startDate: startDate || null,
        dueDate: dueDate || null,
      };

      if (goal) {
        await goals.update.mutateAsync({
          workspaceId,
          goalId: goal._id,
          ...data,
        });
      } else {
        await goals.create.mutateAsync({ workspaceId, ...data });
      }

      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-lg p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-6 py-5 pr-14">
            <DialogTitle>{isEditing ? "Edit goal" : "Create goal"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the goal details and its current status."
                : "Define an objective for this workspace."}
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            aria-label="Close goal dialog"
            disabled={isPending}
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
          >
            <X className="size-4" />
          </button>
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={500}
                placeholder="Goal title"
                required
                autoFocus
              />
            </div>
            <ExpandableDescriptionField value={description} onChange={setDescription} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as GoalStatus)}>
                  <SelectTrigger className="w-full">
                    <span>{STATUS_CONFIG[status].label}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_STATUSES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {STATUS_CONFIG[item].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as GoalPriority)}>
                  <SelectTrigger className="w-full">
                    <span>{priority[0] + priority.slice(1).toLowerCase()}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_PRIORITIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item[0] + item.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <GoalDatePicker id="goal-start-date" label="Start date" value={startDate} onChange={setStartDate} />
              <GoalDatePicker id="goal-due-date" label="Due date" value={dueDate} onChange={setDueDate} />
            </div>
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GoalDetailsDialog({
  goal,
  onClose,
}: {
  goal: GoalDoc;
  onClose: () => void;
}) {
  const statusConfig = STATUS_CONFIG[goal.status];
  const StatusIcon = statusConfig.icon;
  const creatorName =
    `${goal.createdBy.firstName} ${goal.createdBy.lastName}`.trim() ||
    goal.createdBy.username ||
    goal.createdBy.email;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle>Goal details</DialogTitle>
          <DialogDescription>Review the objective, timeline, and ownership.</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close goal details"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="space-y-6 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{goal.title}</h2>
              <Badge variant="outline" className={cn("flex items-center gap-1", statusConfig.badgeClass)}>
                <StatusIcon className="size-3.5" />
                {statusConfig.label}
              </Badge>
            </div>
            <div className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {goal.description || "No description provided."}
            </div>
          </div>
          <dl className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Priority</dt>
              <dd className="mt-1 text-sm font-medium">
                {goal.priority[0] + goal.priority.slice(1).toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created by</dt>
              <dd className="mt-1 text-sm font-medium">{creatorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Start date</dt>
              <dd className="mt-1 text-sm font-medium">
                {goal.startDate ? format(new Date(goal.startDate), "PPP") : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Due date</dt>
              <dd className="mt-1 text-sm font-medium">
                {goal.dueDate ? format(new Date(goal.dueDate), "PPP") : "Not set"}
              </dd>
            </div>
            {goal.completedAt && (
              <div>
                <dt className="text-xs text-muted-foreground">Completed</dt>
                <dd className="mt-1 text-sm font-medium">
                  {format(new Date(goal.completedAt), "PPP")}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex justify-end border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoalDeleteDialog({
  goal,
  workspaceId,
  onClose,
}: {
  goal: GoalDoc;
  workspaceId: string;
  onClose: () => void;
}) {
  const goals = useGoals(workspaceId);
  const [error, setError] = useState<string | null>(null);
  const isPending = goals.remove.isPending;

  async function handleDelete() {
    setError(null);
    try {
      await goals.remove.mutateAsync({ workspaceId, goalId: goal._id });
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-5 pr-14">
          <DialogTitle className="text-destructive">Delete goal</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <button
          type="button"
          aria-label="Close delete goal dialog"
          disabled={isPending}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
        >
          <X className="size-4" />
        </button>
        <div className="px-6 py-5">
          <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">Delete “{goal.title}”?</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                This will permanently remove the goal from the workspace.
              </p>
            </div>
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

type StatusFilter = GoalStatus | "all";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Goals" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STAT_CONFIG: {
  status: GoalStatus;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    status: "PLANNING",
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  {
    status: "IN_PROGRESS",
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  {
    status: "ON_HOLD",
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  {
    status: "COMPLETED",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    status: "CANCELLED",
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10",
  },
];

export function WorkspaceGoals({ workspaceSlug }: { workspaceSlug: string }) {
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspaceBySlug(workspaceSlug);
  const goalsQuery = useGoals(workspace?._id);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialogGoal, setDialogGoal] = useState<GoalDoc | null | undefined>(
    undefined,
  );
  const [detailsGoal, setDetailsGoal] = useState<GoalDoc | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<GoalDoc | null>(null);
  const goals = goalsQuery.data?.goals ?? EMPTY_GOALS;

  const filtered = useMemo(() => {
    if (statusFilter === "all") return goals;
    return goals.filter((g) => g.status === statusFilter);
  }, [goals, statusFilter]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: goals.length };
    for (const g of goals) {
      c[g.status] = (c[g.status] ?? 0) + 1;
    }
    return c;
  }, [goals]);

  const avgProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.round(
      goals.reduce((s, g) => s + goalProgress(g), 0) / goals.length,
    );
  }, [goals]);

  const overallStatus = useMemo((): GoalStatus => {
    if (avgProgress >= 80) return "COMPLETED";
    if (avgProgress > 0) return "IN_PROGRESS";
    return "PLANNING";
  }, [avgProgress]);

  const canManageGoals =
    workspace?.membershipRole === "OWNER" || workspace?.membershipRole === "ADMIN";

  if (isWorkspaceLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading goals…</div>;
  }

  if (!workspace) {
    return <div className="p-8 text-sm text-destructive">Workspace not found or you do not have access.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track objectives and key results for{" "}
            <span className="font-medium text-foreground">
              {workspace.name}
            </span>
          </p>
        </div>
        {canManageGoals && (
          <Button size="sm" className="gap-1.5" onClick={() => setDialogGoal(null)}>
            <Plus className="size-4" />
            New Goal
          </Button>
        )}
      </div>

      {/* ── Overview banner ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-6">
          {/* Progress ring + summary */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <ProgressRing
                value={avgProgress}
                size={68}
                strokeWidth={5}
                status={overallStatus}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
                {avgProgress}%
              </span>
            </div>
            <div>
              <p className="text-base font-bold leading-tight">
                {goals.length} goal{goals.length !== 1 ? "s" : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Overall workspace progress
              </p>
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
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      bgClass,
                      colorClass,
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <p className="text-base font-bold tabular-nums">{count}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {cfg.label}
                  </p>
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
      {goalsQuery.isLoading ? (
        <div className="rounded-2xl border border-border bg-card py-20 text-center text-sm text-muted-foreground">
          Loading goals…
        </div>
      ) : goalsQuery.isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 py-20 text-center text-sm text-destructive">
          {getErrorMessage(goalsQuery.error)}
        </div>
      ) : filtered.length === 0 ? (
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
              key={goal._id}
              goal={goal}
              canManage={canManageGoals}
              onViewDetails={setDetailsGoal}
              onEdit={setDialogGoal}
              onDelete={(goalId) =>
                setDeleteGoal(goals.find((item) => item._id === goalId) ?? null)
              }
            />
          ))}
        </div>
      )}
      {dialogGoal !== undefined && (
        <GoalDialog
          key={dialogGoal?._id ?? "new"}
          goal={dialogGoal}
          workspaceId={workspace._id}
          onClose={() => setDialogGoal(undefined)}
        />
      )}
      {detailsGoal && (
        <GoalDetailsDialog
          key={detailsGoal._id}
          goal={detailsGoal}
          onClose={() => setDetailsGoal(null)}
        />
      )}
      {deleteGoal && (
        <GoalDeleteDialog
          key={deleteGoal._id}
          goal={deleteGoal}
          workspaceId={workspace._id}
          onClose={() => setDeleteGoal(null)}
        />
      )}
    </div>
  );
}
