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
import { AppModalHeader } from "@/components/app/app-modal-header";
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
import { RichTextEditor } from "@/components/app/rich-text-editor";
import { useGoals, useWorkspaceBySlug } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
import type { GoalDoc, GoalPriority, GoalStatus } from "@/types/domain";

// ─── Status config ─────────────────────────────────────────────────────────

type StatusConfig = {
  label: string;
  icon: React.ElementType;
  badgeClass: string;
  ringClass: string;
  borderAccent: string;
  bgAccent: string;
  detailsAccent: string;
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
    detailsAccent: "bg-purple-500/10 text-purple-800 dark:text-purple-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    badgeClass:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ringClass: "stroke-blue-500",
    borderAccent: "border-l-blue-500",
    bgAccent: "bg-blue-500",
    detailsAccent: "bg-blue-500/10 text-blue-800 dark:text-blue-200",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: CirclePause,
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ringClass: "stroke-amber-500",
    borderAccent: "border-l-amber-500",
    bgAccent: "bg-amber-500",
    detailsAccent: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ringClass: "stroke-emerald-500",
    borderAccent: "border-l-emerald-500",
    bgAccent: "bg-emerald-500",
    detailsAccent: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Ban,
    badgeClass:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    ringClass: "stroke-red-500",
    borderAccent: "border-l-red-500",
    bgAccent: "bg-red-500",
    detailsAccent: "bg-red-500/10 text-red-800 dark:text-red-200",
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

function getPlainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  const showDetails = () => onViewDetails(goal);

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showDetails();
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border border-l-[3px] bg-card transition-all duration-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg",
        cfg.borderAccent,
      )}
    >
      {/* Card body */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`View details for ${goal.title}`}
        onClick={showDetails}
        onKeyDown={handleCardKeyDown}
        className="flex cursor-pointer items-start gap-4 p-5 pr-12 outline-none transition-colors focus-visible:bg-emerald-500/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
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
            {getPlainText(goal.details)}
          </p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {/* Owner */}
            <div className="flex items-center gap-1.5">
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
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
      </div>

      {/* Actions */}
      <div className="absolute right-5 top-5 flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-emerald-500/5 hover:text-foreground"
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-xs"
              onClick={showDetails}
            >
              <Eye className="size-3.5" />
              View details
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-xs"
                  onClick={() => onEdit(goal)}
                >
                  <Pencil className="size-3.5" />
                  Edit goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
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
            "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm shadow-xs outline-none transition-colors hover:bg-emerald-500/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <span>
            {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
          </span>
          <CalendarDays className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) =>
              onChange(date ? format(date, "yyyy-MM-dd") : "")
            }
            captionLayout="dropdown"
          />
          {selectedDate && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => onChange("")}
              >
                Clear date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function GoalDetailsEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>Goal details</Label>
      <RichTextEditor
        value={value}
        onChange={onChange}
        disabled={disabled}
        ariaLabel="Goal details"
        placeholder="Add context, milestones, or a checklist…"
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
  const [details, setDetails] = useState(goal?.details ?? "");
  const [status, setStatus] = useState<GoalStatus>(goal?.status ?? "PLANNING");
  const [priority, setPriority] = useState<GoalPriority>(
    goal?.priority ?? "MEDIUM",
  );
  const [startDate, setStartDate] = useState(
    toDateInputValue(goal?.startDate ?? null),
  );
  const [dueDate, setDueDate] = useState(
    toDateInputValue(goal?.dueDate ?? null),
  );
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(goal);
  const isPending = goals.create.isPending || goals.update.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const data = {
        title: title.trim(),
        details,
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
          <AppModalHeader
            title={isEditing ? "Edit goal" : "Create goal"}
            description={
              isEditing
                ? "Update the goal details and its current status."
                : "Define an objective for this workspace."
            }
            icon={Target}
            onClose={onClose}
            closeLabel="Close goal dialog"
            disabled={isPending}
          />
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
            <GoalDetailsEditor
              value={details}
              onChange={setDetails}
              disabled={isPending}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as GoalStatus)}
                >
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
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as GoalPriority)}
                >
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
              <GoalDatePicker
                id="goal-start-date"
                label="Start date"
                value={startDate}
                onChange={setStartDate}
              />
              <GoalDatePicker
                id="goal-due-date"
                label="Due date"
                value={dueDate}
                onChange={setDueDate}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : isEditing
                  ? "Save changes"
                  : "Create goal"}
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
  const priorityLabel = goal.priority[0] + goal.priority.slice(1).toLowerCase();
  const isCompleted = goal.status === "COMPLETED";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader
          className={cn("relative gap-4 p-6 pb-5", statusConfig.detailsAccent)}
        >
          <button
            type="button"
            aria-label="Close goal details"
            onClick={onClose}
            className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-current/70 transition-colors hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                statusConfig.bgAccent,
              )}
            >
              <StatusIcon className="size-5" />
            </span>
            <div className="min-w-0 pr-8">
              <DialogDescription className="font-medium text-current/75">
                {statusConfig.label} goal
              </DialogDescription>
              <DialogTitle className="mt-1 text-xl leading-tight">
                {goal.title}
              </DialogTitle>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-current/10 bg-background/35 p-3">
            <div className="relative shrink-0">
              <ProgressRing
                value={goalProgress(goal)}
                size={42}
                strokeWidth={4}
                status={goal.status}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
                {goalProgress(goal)}%
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-current/70">
                Goal progress
              </p>
              <p className="text-sm font-semibold">
                {isCompleted ? "Completed" : "In progress"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <dl className="space-y-3 p-6 text-sm">
          <GoalDetailRow
            icon={Target}
            label="Priority"
            value={priorityLabel}
            tone="bg-violet-500/10 text-violet-700 dark:text-violet-300"
          />
          <GoalDetailRow
            icon={CalendarDays}
            label="Timeline"
            value={`${goal.startDate ? format(new Date(goal.startDate), "PPP") : "No start date"} — ${goal.dueDate ? format(new Date(goal.dueDate), "PPP") : "No due date"}`}
            tone="bg-blue-500/10 text-blue-700 dark:text-blue-300"
          />
          <GoalDetailRow
            icon={CheckCircle2}
            label="Owner"
            value={creatorName}
            tone="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          />
          <GoalRichTextRow details={goal.details} />
          {(goal.completedAt || isCompleted) && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Goal completed</p>
                <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                  {goal.completedAt
                    ? `Completed on ${format(new Date(goal.completedAt), "PPP")}`
                    : "This goal is marked as completed."}
                </p>
              </div>
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function GoalDetailRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          tone,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="pt-0.5 text-xs font-medium text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}

function GoalRichTextRow({ details }: { details: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
        <Pencil className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="pt-0.5 text-xs font-medium text-muted-foreground">
          Goal details
        </dt>
        {details ? (
          <dd
            className="mt-1 text-sm font-medium text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: details }}
          />
        ) : (
          <dd className="mt-1 text-sm font-medium text-muted-foreground">
            No goal details provided.
          </dd>
        )}
      </div>
    </div>
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
        <AppModalHeader
          title="Delete goal"
          description="This action cannot be undone."
          icon={AlertTriangle}
          tone="destructive"
          onClose={onClose}
          closeLabel="Close delete goal dialog"
          disabled={isPending}
        />
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
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
  const { workspace, isLoading: isWorkspaceLoading } =
    useWorkspaceBySlug(workspaceSlug);
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
    if (goals.length === 0) return "PLANNING";
    if (goals.every((goal) => goal.status === "COMPLETED")) return "COMPLETED";
    if (
      goals.some(
        (goal) => goal.status === "IN_PROGRESS" || goal.status === "COMPLETED",
      )
    ) {
      return "IN_PROGRESS";
    }
    if (goals.some((goal) => goal.status === "ON_HOLD")) return "ON_HOLD";
    if (goals.every((goal) => goal.status === "CANCELLED")) return "CANCELLED";
    return "PLANNING";
  }, [goals]);

  const completedGoalCount = useMemo(
    () => goals.filter((goal) => goal.status === "COMPLETED").length,
    [goals],
  );

  const canManageGoals =
    workspace?.membershipRole === "OWNER" ||
    workspace?.membershipRole === "ADMIN";

  if (isWorkspaceLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading goals…</div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 text-sm text-destructive">
        Workspace not found or you do not have access.
      </div>
    );
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
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setDialogGoal(null)}
          >
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
                {goals.length === 0
                  ? "Create a goal to get started"
                  : `${completedGoalCount} of ${goals.length} completed`}
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
                    "flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-transparent px-3.75 py-2.25 transition-colors",
                    statusFilter === status &&
                      "border-primary/20 bg-emerald-500/10 dark:bg-emerald-400/10",
                    statusFilter !== status &&
                      "hover:border-primary/20 hover:bg-muted/40",
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
              "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-emerald-500/5 hover:text-foreground",
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
