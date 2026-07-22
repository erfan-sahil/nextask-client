"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Loader2,
  Plus,
  Target,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { CreateMeetingDialog } from "@/components/app/calendar/create-meeting-dialog";
import { Button } from "@/components/ui/button";
import { useCalendar, useWorkspaceBySlug } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
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

const EVENT_ICON: Record<CalendarEventType, React.ElementType> = {
  "task-deadline": ListTodo,
  "goal-deadline": Target,
  meeting: Users,
};

const toDateString = (date: Date) => format(date, "yyyy-MM-dd");
const eventDate = (event: CalendarEventDoc) =>
  toDateString(new Date(event.startsAt));

function EventPill({ event }: { event: CalendarEventDoc }) {
  const time =
    event.type === "meeting" ? format(new Date(event.startsAt), "p") : "Due";

  return (
    <div
      title={`${event.title} · ${time}`}
      className={cn(
        "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        EVENT_STYLE[event.type],
      )}
    >
      {event.type === "meeting" && `${time} · `}
      {event.title}
    </div>
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
          <Button size="sm" onClick={() => openMeetingDialog(today)}>
            <Plus className="size-4" />
            Schedule meeting
          </Button>
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
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
                  <button
                    key={date}
                    type="button"
                    onClick={() =>
                      cell.currentMonth && openMeetingDialog(cell.date)
                    }
                    className={cn(
                      "min-h-26 border-r border-b p-2 text-left transition-colors",
                      index % 7 === 6 && "border-r-0",
                      isToday && "bg-primary/5",
                      cell.currentMonth && "hover:bg-muted/50",
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
                        <EventPill key={event.id} event={event} />
                      ))}
                      {cellEvents.length > 2 && (
                        <p className="px-1 text-[10px] text-muted-foreground">
                          +{cellEvents.length - 2} more
                        </p>
                      )}
                    </div>
                  </button>
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
              <ul className="space-y-3">
                {upcomingEvents.map((event) => {
                  const Icon = EVENT_ICON[event.type];
                  const eventStartsAt = new Date(event.startsAt);

                  return (
                    <li key={event.id} className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "mt-1 flex size-5 shrink-0 items-center justify-center rounded-md",
                          EVENT_STYLE[event.type],
                        )}
                      >
                        <Icon className="size-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {event.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {format(
                            eventStartsAt,
                            event.type === "meeting"
                              ? "EEE, MMM d · p"
                              : "EEE, MMM d",
                          )}
                        </p>
                      </div>
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
  return (
    <div className="flex items-center gap-2">
      <span className={cn("size-2 rounded-full", EVENT_STYLE[type])} />
      {label}
    </div>
  );
}
