"use client";

import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { CalendarEventDetailsDialog } from "@/components/app/calendar/calendar-event-details-dialog";
import { CreateMeetingDialog } from "@/components/app/calendar/create-meeting-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCalendar, useWorkspaceBySlug } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
import { canManageWorkspaceContent } from "@/lib/workspace-permissions";
import type { CalendarEventDoc, CalendarEventType } from "@/types/domain";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EVENT_STYLE: Record<CalendarEventType, string> = {
  "task-deadline": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "goal-deadline": "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  meeting: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

const PAST_EVENT_STYLE: Record<CalendarEventType, string> = {
  "task-deadline": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "goal-deadline": "bg-violet-500/5 text-violet-700/65 dark:text-violet-300/65",
  meeting: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

const EVENT_DOT_STYLE: Record<CalendarEventType, string> = {
  "task-deadline": "bg-blue-500",
  "goal-deadline": "bg-violet-500",
  meeting: "bg-emerald-500",
};

const EVENT_ICON: Record<CalendarEventType, React.ElementType> = {
  "task-deadline": ListTodo,
  "goal-deadline": Target,
  meeting: Users,
};

const toDateString = (date: Date) => format(date, "yyyy-MM-dd");
const eventDate = (event: CalendarEventDoc) =>
  toDateString(new Date(event.startsAt));

function EventPill({
  event,
  isPast,
  onClick,
}: {
  event: CalendarEventDoc;
  isPast: boolean;
  onClick: () => void;
}) {
  const time =
    event.type === "meeting" ? format(new Date(event.startsAt), "p") : "Due";

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick();
      }}
      title={`${event.title} · ${isPast ? "Passed" : time}`}
      className={cn(
        "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-75",
        isPast ? PAST_EVENT_STYLE[event.type] : EVENT_STYLE[event.type],
      )}
    >
      {event.type === "meeting" && `${time} · `}
      {event.title}
    </button>
  );
}

export function WorkspaceCalendarView({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState(today);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDoc | null>(
    null,
  );
  const [editingMeeting, setEditingMeeting] = useState<CalendarEventDoc | null>(
    null,
  );
  const [deletingMeeting, setDeletingMeeting] =
    useState<CalendarEventDoc | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const {
    workspace,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
  } = useWorkspaceBySlug(workspaceSlug);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startDate = toDateString(new Date(year, month, 1));
  const endDate = toDateString(new Date(year, month + 1, 1));
  const calendar = useCalendar(workspace?._id, startDate, endDate);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const nextCells = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
      const date = new Date(year, month - 1, daysInPreviousMonth - index);
      nextCells.push({ date, currentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      nextCells.push({ date: new Date(year, month, day), currentMonth: true });
    }

    const remaining = Math.ceil(nextCells.length / 7) * 7 - nextCells.length;
    for (let day = 1; day <= remaining; day += 1) {
      nextCells.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return nextCells;
  }, [month, year]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventDoc[]> = {};
    for (const event of calendar.events) {
      const date = eventDate(event);
      map[date] ??= [];
      map[date].push(event);
    }
    return map;
  }, [calendar.events]);

  const upcomingEvents = useMemo(
    () =>
      calendar.events
        .filter((event) => eventDate(event) >= toDateString(today))
        .sort(
          (first, second) =>
            new Date(first.startsAt).getTime() -
            new Date(second.startsAt).getTime(),
        )
        .slice(0, 8),
    [calendar.events, today],
  );

  const openMeetingDialog = (date: Date) => {
    setMeetingDate(date);
    setIsMeetingDialogOpen(true);
  };

  const deleteMeeting = async () => {
    if (!deletingMeeting || !workspace) {
      return;
    }

    try {
      setDeleteError(null);
      await calendar.deleteMeeting.mutateAsync({
        workspaceId: workspace._id,
        meetingId: deletingMeeting.resourceId,
      });
      setDeletingMeeting(null);
    } catch (deleteMeetingError) {
      setDeleteError(
        getErrorMessage(deleteMeetingError, "Unable to delete the meeting."),
      );
    }
  };

  if (isWorkspaceLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace || workspaceError) {
    return (
      <div className="p-6 text-sm text-destructive">
        {getErrorMessage(workspaceError, "Unable to load this workspace.")}
      </div>
    );
  }

  const canCreateMeetings = canManageWorkspaceContent(workspace.membershipRole);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Deadlines and meetings for{" "}
            <span className="font-medium text-foreground">
              {workspace.name}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canCreateMeetings && (
            <Button size="sm" onClick={() => openMeetingDialog(today)}>
              <Plus className="size-4" />
              Schedule meeting
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))
            }
          >
            Today
          </Button>
          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-36 border-x border-border px-2 text-center text-sm font-semibold">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-emerald-500/5 hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {calendar.isLoading ? (
            <div className="flex min-h-100 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : calendar.error ? (
            <p className="p-6 text-sm text-destructive">
              {getErrorMessage(
                calendar.error,
                "Unable to load calendar events.",
              )}
            </p>
          ) : (
            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                const date = toDateString(cell.date);
                const cellEvents = eventsByDate[date] ?? [];
                const isToday = date === toDateString(today);

                return (
                  <div
                    key={date}
                    onClick={() =>
                      canCreateMeetings &&
                      cell.currentMonth &&
                      openMeetingDialog(cell.date)
                    }
                    className={cn(
                      "min-h-26 border-r border-b p-2 text-left transition-colors",
                      index % 7 === 6 && "border-r-0",
                      isToday && "bg-primary/10",
                      canCreateMeetings &&
                        cell.currentMonth &&
                        "cursor-pointer hover:bg-emerald-500/5",
                      !cell.currentMonth && "cursor-default opacity-50",
                    )}
                  >
                    <div className="mb-1.5 flex justify-end">
                      <span
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80",
                        )}
                      >
                        {cell.date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {cellEvents.slice(0, 2).map((event) => (
                        <EventPill
                          key={event.id}
                          event={event}
                          isPast={date < toDateString(today)}
                          onClick={() => setSelectedEvent(event)}
                        />
                      ))}
                      {cellEvents.length > 2 && (
                        <p className="px-1 text-[10px] text-muted-foreground">
                          +{cellEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Upcoming</h2>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming events.
              </p>
            ) : (
              <ul className="space-y-1">
                {upcomingEvents.map((event) => {
                  const Icon = EVENT_ICON[event.type];
                  const eventStartsAt = new Date(event.startsAt);

                  return (
                    <li key={event.id} className="flex items-start gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="group flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-md px-1 py-1 text-left"
                      >
                        <div
                          className={cn(
                            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-md",
                            EVENT_STYLE[event.type],
                          )}
                        >
                          <Icon className="size-3" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium transition-colors group-hover:text-primary">
                            {event.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
                            {format(
                              eventStartsAt,
                              event.type === "meeting"
                                ? "EEE, MMM d · p"
                                : "EEE, MMM d",
                            )}
                          </p>
                        </div>
                      </button>
                      {canCreateMeetings && event.type === "meeting" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-label={`Manage ${event.title}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEvent(null);
                                setEditingMeeting(event);
                              }}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setDeleteError(null);
                                setDeletingMeeting(event);
                              }}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <p className="text-[10px] font-semibold uppercase tracking-wider">
                Legend
              </p>
              <LegendItem type="task-deadline" label="Task deadline" />
              <LegendItem type="goal-deadline" label="Goal deadline" />
              <LegendItem type="meeting" label="Meeting" />
            </div>
          </div>
        </aside>
      </div>

      {canCreateMeetings && (
        <CreateMeetingDialog
          key={`${isMeetingDialogOpen}-${toDateString(meetingDate)}`}
          open={isMeetingDialogOpen}
          defaultDate={meetingDate}
          isPending={calendar.createMeeting.isPending}
          onOpenChange={setIsMeetingDialogOpen}
          onCreate={async (meeting) => {
            await calendar.createMeeting.mutateAsync({
              workspaceId: workspace._id,
              ...meeting,
            });
          }}
        />
      )}
      {canCreateMeetings && editingMeeting && (
        <CreateMeetingDialog
          key={`edit-${editingMeeting.id}`}
          open
          defaultDate={new Date(editingMeeting.startsAt)}
          isPending={calendar.updateMeeting.isPending}
          meeting={editingMeeting}
          onOpenChange={(open) => !open && setEditingMeeting(null)}
          onUpdate={async (meeting) => {
            await calendar.updateMeeting.mutateAsync({
              workspaceId: workspace._id,
              meetingId: editingMeeting.resourceId,
              ...meeting,
            });
          }}
        />
      )}
      <CalendarEventDetailsDialog
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />
      <Dialog
        open={Boolean(deletingMeeting)}
        onOpenChange={(open) => {
          if (!open && !calendar.deleteMeeting.isPending) {
            setDeletingMeeting(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md overflow-hidden p-0">
          <AppModalHeader
            title="Delete meeting"
            description="This action cannot be undone."
            icon={AlertTriangle}
            tone="destructive"
            onClose={() => setDeletingMeeting(null)}
            closeLabel="Close delete meeting dialog"
            disabled={calendar.deleteMeeting.isPending}
          />
          <div className="px-6 py-5">
            <div className="flex gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">
                  Delete “{deletingMeeting?.title ?? "this meeting"}”?
                </p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  This will permanently remove the meeting from the workspace.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {deleteError}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingMeeting(null)}
              disabled={calendar.deleteMeeting.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteMeeting}
              disabled={calendar.deleteMeeting.isPending}
            >
              {calendar.deleteMeeting.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete meeting
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LegendItem({
  type,
  label,
}: {
  type: CalendarEventType;
  label: string;
}) {
  const Icon = EVENT_ICON[type];

  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1 text-foreground">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md text-white",
          EVENT_DOT_STYLE[type],
        )}
      >
        <Icon className="size-3" />
      </span>
      <span>{label}</span>
    </div>
  );
}
