import { Crown, Eye, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/types/workspace";

const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    className: "border-primary/20 bg-primary/10 text-primary",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    className: "border-chart-2/20 bg-chart-2/10 text-chart-2",
    icon: Shield,
  },
  member: {
    label: "Member",
    className: "border-border bg-muted text-muted-foreground",
    icon: User,
  },
  viewer: {
    label: "Viewer",
    className: "border-chart-5/20 bg-chart-5/10 text-chart-5",
    icon: Eye,
  },
} satisfies Record<MemberRole, { label: string; className: string; icon: React.ElementType }>;

export function RoleBadge({ role }: { role: MemberRole }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        cfg.className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

export { ROLE_CONFIG };
