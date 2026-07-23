"use client";

import {
  AtSign,
  Bell,
  CheckCheck,
  CheckSquare,
  Clock,
  MessageCircle,
  MessageSquare,
  Pencil,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/use-workflow";
import { cn } from "@/lib/utils";
import type { NotificationDoc } from "@/types/domain";

const notificationTypeConfig: Record<
  NotificationDoc["type"],
  {
    label: string;
    icon: React.ElementType;
    accent: string;
    iconAccent: string;
  }
> = {
  TASK_ASSIGNED: {
    label: "Task assignment",
    icon: CheckSquare,
    accent: "bg-blue-500/10 text-blue-800 dark:text-blue-200",
    iconAccent: "bg-blue-500",
  },
  TASK_UPDATED: {
    label: "Task update",
    icon: Pencil,
    accent: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
    iconAccent: "bg-amber-500",
  },
  TASK_COMMENT: {
    label: "Task comment",
    icon: MessageSquare,
    accent: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
    iconAccent: "bg-emerald-500",
  },
  MENTION: {
    label: "Mention",
    icon: AtSign,
    accent: "bg-violet-500/10 text-violet-800 dark:text-violet-200",
    iconAccent: "bg-violet-500",
  },
  CHAT_MENTION: {
    label: "Chat mention",
    icon: MessageCircle,
    accent: "bg-rose-500/10 text-rose-800 dark:text-rose-200",
    iconAccent: "bg-rose-500",
  },
};

export function NotificationsInbox() {
  const notifications = useNotifications();
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationDoc | null>(null);
  const markedNotificationIds = useRef(new Set<string>());
  const items = notifications.data?.notifications ?? [];
  const unreadCount = notifications.data?.unreadCount ?? 0;

  useEffect(() => {
    if (
      selectedNotification &&
      !selectedNotification.readAt &&
      !markedNotificationIds.current.has(selectedNotification._id)
    ) {
      markedNotificationIds.current.add(selectedNotification._id);
      notifications.markRead.mutate(selectedNotification._id);
    }
  }, [notifications.markRead, selectedNotification]);

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
            <li key={item._id}>
              <button
                type="button"
                onClick={() => setSelectedNotification(item)}
                className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${!item.readAt ? "bg-primary/5" : ""}`}
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">{item.message}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </span>
                {!item.readAt && <span className="mt-1.5 size-2 rounded-full bg-primary" aria-label="Unread" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <NotificationDetailsDialog
        notification={selectedNotification}
        onOpenChange={(open) => {
          if (!open) setSelectedNotification(null);
        }}
      />
    </div>
  );
}

function NotificationDetailsDialog({
  notification,
  onOpenChange,
}: {
  notification: NotificationDoc | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!notification) return null;

  const actorName = `${notification.actorId.firstName} ${notification.actorId.lastName}`.trim();
  const displayName = actorName || notification.actorId.username;
  const config = notificationTypeConfig[notification.type];
  const NotificationIcon = config.icon;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <DialogHeader className={cn("relative gap-4 p-6 pb-5", config.accent)}>
          <button
            type="button"
            aria-label="Close notification details"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-current/70 transition-colors hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
          >
            <X className="size-4" />
          </button>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                config.iconAccent,
              )}
            >
              <NotificationIcon className="size-5" />
            </span>
            <div className="min-w-0 pr-8">
              <DialogDescription className="font-medium text-current/75">
                {config.label}
              </DialogDescription>
              <DialogTitle className="mt-1 text-xl leading-tight">
                Notification details
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <dl className="space-y-3 p-6 text-sm">
          <NotificationDetailRow
            icon={NotificationIcon}
            label="Message"
            value={notification.message}
            tone={config.accent}
          />
          <div className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
            <UserAvatar
              name={displayName}
              avatar={notification.actorId.avatar}
              size="sm"
            />
            <div className="min-w-0">
              <dt className="pt-0.5 text-xs font-medium text-muted-foreground">
                From
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {displayName}
              </dd>
            </div>
          </div>
          <NotificationDetailRow
            icon={Clock}
            label="Received"
            value={formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
            tone="bg-slate-500/10 text-slate-700 dark:text-slate-300"
          />
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function NotificationDetailRow({
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
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="pt-0.5 text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}
