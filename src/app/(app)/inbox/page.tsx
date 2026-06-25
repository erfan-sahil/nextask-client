import { Bell, CheckCheck, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inbox — NexTask" };

const notifications = [
  {
    id: "n-1",
    icon: MessageSquare,
    tone: "bg-chart-2/15 text-chart-2",
    title: "Alex Kim commented on Auth flow review",
    body: "Looks good — let's add a note about session expiry in the acceptance criteria.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n-2",
    icon: MessageSquare,
    tone: "bg-chart-2/15 text-chart-2",
    title: "Jordan Reed commented on API integration plan",
    body: "Webhook retries should be idempotent. I'll draft the error handling section.",
    time: "4h ago",
    unread: true,
  },
  {
    id: "n-3",
    icon: Bell,
    tone: "bg-primary/10 text-primary",
    title: "Sprint Board was updated",
    body: "Leo Martinez moved 3 tasks to In Progress.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n-4",
    icon: CheckCheck,
    tone: "bg-chart-3/15 text-chart-3",
    title: "Project templates task completed",
    body: "Jordan Reed marked Project templates as done.",
    time: "2 days ago",
    unread: false,
  },
];

export default function InboxPage() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
              >
                <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                    {item.body}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <time className="text-xs text-muted-foreground">{item.time}</time>
                  {item.unread && (
                    <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
