"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  MapPin,
  MessageSquare,
  Target,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CalendarEventDoc } from "@/types/domain";

const EVENT_CONFIG = {
  "task-deadline": {
    label: "Task deadline",
    icon: ListTodo,
    accent: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500",
  },
  "goal-deadline": {
    label: "Goal deadline",
    icon: Target,
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    badge: "bg-violet-500",
  },
  meeting: {
    label: "Meeting",
    icon: Users,
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-500",
  },
} as const;

export function CalendarEventDetailsDialog({
  event,
  onOpenChange,
}: {
  event: CalendarEventDoc | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!event) {
    return null;
  }

  const isMeeting = event.type === "meeting";
  const date = new Date(event.startsAt);
  const message = isMeeting ? event.message : event.description;
  const config = EVENT_CONFIG[event.type];
  const EventIcon = config.icon;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className={cn("relative gap-4 p-6 pb-5", config.accent)}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-current/70 transition-colors hover:bg-black/10 hover:text-current focus-visible:ring-2 focus-visible:ring-current/40 focus-visible:outline-none"
            aria-label="Close details"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                config.badge,
              )}
            >
              <EventIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogDescription className="font-medium text-current/80">
                {config.label}
              </DialogDescription>
              <DialogTitle className="mt-1 text-xl leading-tight">
                {event.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <dl className="space-y-3 p-6 text-sm">
          <DetailRow
            icon={isMeeting ? Clock : CalendarDays}
            label={isMeeting ? "Scheduled for" : "Due date"}
            value={format(date, isMeeting ? "PPP 'at' p" : "PPP")}
          />
          {event.location && (
            <DetailRow icon={MapPin} label="Location" value={event.location} />
          )}
          {message && (
            <DetailRow
              icon={MessageSquare}
              label={isMeeting ? "Message for attendees" : "Details"}
              value={message}
            />
          )}
          {!message && !event.location && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0" />
              No additional details were added.
            </div>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-muted/20 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 whitespace-pre-wrap text-foreground">{value}</dd>
      </div>
    </div>
  );
}
