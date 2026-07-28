import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { appRoutes } from "@/config/navigation";
import type { DashboardMeeting } from "@/types/workspace";

type UpcomingMeetingsProps = {
  meetings: DashboardMeeting[];
};

function formatMeetingTime(startsAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startsAt));
}

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  return (
    <section aria-label="Upcoming meetings">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="size-4 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">Upcoming meetings</h2>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {meetings.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No upcoming meetings.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {meetings.map((meeting) => (
              <li key={meeting._id}>
                <Link
                  href={appRoutes.workspaceCalendar(meeting.workspace.slug)}
                  className="block p-4 transition-colors hover:bg-muted/50"
                >
                  <p className="truncate text-sm font-medium">{meeting.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {meeting.workspace.name} · {formatMeetingTime(meeting.startsAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {meeting.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden />
                        {meeting.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" aria-hidden />
                      {meeting.attendeeCount} attendee
                      {meeting.attendeeCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
