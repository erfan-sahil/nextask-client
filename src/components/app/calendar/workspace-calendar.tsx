"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock, FolderKanban, ListTodo } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { mockBoard, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

// ─── Types ────────────────────────────────────────────────────────────────────

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "task" | "project";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildEvents(workspaceId: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const p of mockProjects.filter((p) => p.workspaceId === workspaceId)) {
    if (p.dueDate) events.push({ id: `proj-${p.id}`, title: p.name, date: p.dueDate, type: "project" });
  }
  for (const task of mockBoard.columns.flatMap((c) => c.tasks)) {
    if (task.dueDate) events.push({ id: `task-${task.id}`, title: task.title, date: task.dueDate, type: "task" });
  }
  return events;
}

// ─── Event pill ───────────────────────────────────────────────────────────────

function EventPill({ event }: { event: CalendarEvent }) {
  return (
    <div
      title={event.title}
      className={cn(
        "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        event.type === "project"
          ? "bg-primary/15 text-primary"
          : "bg-chart-2/15 text-chart-2",
      )}
    >
      {event.title}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkspaceCalendar({ workspace }: { workspace: Workspace }) {
  const today = new Date();
  const todayStr = toDateStr(today);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const events = useMemo(() => buildEvents(workspace.id), [workspace.id]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build cells
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; dateStr: string }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, currentMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  const remaining = Math.ceil(cells.length / 7) * 7 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, currentMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8),
    [events, todayStr],
  );

  const monthEventCount = useMemo(
    () => events.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length,
    [events, year, month],
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Deadlines and milestones for{" "}
            <span className="font-medium text-foreground">{workspace.name}</span>
            {monthEventCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Clock className="size-3" />
                {monthEventCount} this month
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
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
        {/* ── Calendar grid ── */}
        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "py-3 text-center text-xs font-semibold uppercase tracking-wider",
                  i === 0 || i === 6 ? "text-muted-foreground/70" : "text-muted-foreground",
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isToday = cell.currentMonth && cell.dateStr === todayStr;
              const isWeekend = i % 7 === 0 || i % 7 === 6;
              const cellEvents = eventsByDate[cell.dateStr] ?? [];

              return (
                <div
                  key={i}
                  className={cn(
                    "group min-h-[104px] border-r border-border p-2 transition-colors",
                    "border-b",
                    i % 7 === 6 && "border-r-0",
                    isToday && "bg-primary/5",
                    cell.currentMonth && !isToday && "hover:bg-emerald-500/5 cursor-pointer",
                  )}
                >
                  {/* Day number — top right */}
                  <div className="mb-1.5 flex justify-end">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : cell.currentMonth
                            ? isWeekend
                              ? "text-muted-foreground"
                              : "text-foreground/80"
                            : "text-muted-foreground/50",
                      )}
                    >
                      {cell.day}
                    </span>
                  </div>

                  {/* Event pills */}
                  <div className="space-y-0.5">
                    {cellEvents.slice(0, 2).map((ev) => (
                      <EventPill key={ev.id} event={ev} />
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
        </div>

        {/* ── Upcoming sidebar ── */}
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Upcoming</h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-1 flex size-5 shrink-0 items-center justify-center rounded-md",
                        ev.type === "project"
                          ? "bg-primary/10 text-primary"
                          : "bg-chart-2/10 text-chart-2",
                      )}
                    >
                      {ev.type === "project"
                        ? <FolderKanban className="size-3" />
                        : <ListTodo className="size-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground">{ev.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 space-y-2 border-t border-border pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Legend
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-primary" />
                Project deadline
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-chart-2" />
                Task due date
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
