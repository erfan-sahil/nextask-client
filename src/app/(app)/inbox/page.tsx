import type { Metadata } from "next";
import { NotificationsInbox } from "@/components/app/notifications-inbox";

export const metadata: Metadata = { title: "Inbox — NexTask" };

export default function InboxPage() {
  return <NotificationsInbox />;
}
