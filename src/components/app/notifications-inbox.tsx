"use client";

import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-workflow";

export function NotificationsInbox() {
  const notifications = useNotifications();
  const items = notifications.data?.notifications ?? [];
  const unreadCount = notifications.data?.unreadCount ?? 0;

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => notifications.markAllRead.mutate()} disabled={notifications.markAllRead.isPending}>
            <CheckCheck className="mr-2 size-4" /> Mark all as read
          </Button>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card">
        {notifications.isLoading ? <p className="px-5 py-8 text-sm text-muted-foreground">Loading notifications…</p> : null}
        {!notifications.isLoading && !items.length ? <p className="px-5 py-8 text-sm text-muted-foreground">No notifications yet.</p> : null}
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item._id} className={`flex items-start gap-4 px-5 py-4 ${!item.readAt ? "bg-primary/5" : ""}`}>
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{item.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!item.readAt && <span className="mt-1.5 size-2 rounded-full bg-primary" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
