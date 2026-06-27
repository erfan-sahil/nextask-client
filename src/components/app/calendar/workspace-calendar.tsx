"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockProjects, mockBoard } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types/workspace";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: "task" | "project";
  color: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildEvents(workspaceId: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const wsProjects = mockProjects.filter((p) => p.workspaceId === workspaceId);
  for (const project of wsProjects) {
    if (project.dueDate) {
      events.push({
        id: `proj-${project.id}`,
        title: project.name,
        date: project.dueDate,
        type: "project",
        color: "bg-primary/80 text-primary-foreground",
      });
    }
  }

  for (const task of mockBoard.columns.flatMap((c) => c.tasks)) {
    if (task.dueDate) {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        type: "task",
        color: "bg-chart-2/80 text-white",
      });
    }
  }

  return events;
}

export function WorkspaceCalendar({ workspace }: { workspace: Workspace }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const events = useMemo(() => buildEvents(workspace.id), [workspace.id]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

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
    cells.push({
      day: d,
      currentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, currentMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [events]);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const upcomingEvents = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="flex min-h-0 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Task deadlines and project milestones for{" "}
            <span className="font-medium text-foreground">{workspace.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={prevMonth}
              className="flex size-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-36 px-2 text-center text-sm font-semibold">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex size-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-6 lg:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const isToday = cell.currentMonth && cell.dateStr === todayStr;
              const cellEvents = eventsByDate[cell.dateStr] ?? [];

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[88px] border-b border-r border-border p-1.5 last:border-r-0 transition-colors",
                    !cell.currentMonth && "bg-muted/30",
                    cell.currentMonth && "hover:bg-muted/20",
                    i % 7 === 6 && "border-r-0",
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex size-7 items-center justify-center rounded-full text-sm font-medium",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : cell.currentMonth
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                    )}
                  >
                    {cell.day}
                  </div>
                  <div className="space-y-0.5">
                    {cellEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight",
                          ev.color,
                        )}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cellEvents.length > 2 && (
                      <div className="px-1 text-[10px] text-muted-foreground">
                        +{cellEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Upcoming</h2>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <div className={cn("mt-0.5 size-2 shrink-0 rounded-full", ev.type === "project" ? "bg-primary" : "bg-chart-2")} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="ml-1.5">
                          <Badge variant="outline" className="px-1 py-0 text-[10px]">
                            {ev.type}
                          </Badge>
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 space-y-2 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
