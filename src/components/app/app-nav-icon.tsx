import {
  Bell,
  CheckSquare,
  Columns3,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Layers,
  Settings,
} from "lucide-react";
import type { AppNavItem } from "@/config/navigation";

const iconMap = {
  dashboard: LayoutDashboard,
  workspaces: Layers,
  projects: FolderKanban,
  boards: Columns3,
  tasks: CheckSquare,
  inbox: Inbox,
  settings: Settings,
} as const;

export function AppNavIcon({
  icon,
  className,
}: {
  icon: AppNavItem["icon"];
  className?: string;
}) {
  const Icon = iconMap[icon];
  return <Icon className={className} aria-hidden />;
}

export function NotificationIcon({ className }: { className?: string }) {
  return <Bell className={className} aria-hidden />;
}
