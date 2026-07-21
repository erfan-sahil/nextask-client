"use client";

import {
  Crown,
  ListFilter,
  LogOut,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useWorkspaceBySlug, useWorkspaceMembers } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { cn } from "@/lib/utils";
import type { MemberDoc, MemberRole } from "@/types/domain";

const ROLE_ORDER: MemberRole[] = ["OWNER", "ADMIN", "MEMBER"];
const EDITABLE_ROLES: MemberRole[] = ["ADMIN", "MEMBER"];
const EMPTY_MEMBERS: MemberDoc[] = [];
const ROLE_FILTER_OPTIONS: { value: MemberRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OWNER", label: "Owners" },
  { value: "ADMIN", label: "Admins" },
  { value: "MEMBER", label: "Members" },
];

const roleConfig: Record<
  MemberRole,
  { label: string; className: string; icon: React.ElementType }
> = {
  OWNER: {
    label: "Owner",
    className: "border-primary/20 bg-primary/10 text-primary",
    icon: Crown,
  },
  ADMIN: {
    label: "Admin",
    className: "border-chart-2/20 bg-chart-2/10 text-chart-2",
    icon: Shield,
  },
  MEMBER: {
    label: "Member",
    className: "border-border bg-muted text-muted-foreground",
    icon: User,
  },
};

type MemberModalState =
  | { mode: "invite" }
  | { mode: "details" | "role" | "remove"; member: MemberDoc }
  | null;

function getMemberName(member: MemberDoc) {
  return `${member.userId.firstName} ${member.userId.lastName}`.trim() || member.userId.email;
}

function RoleBadge({ role }: { role: MemberRole }) {
  const { label, className, icon: Icon } = roleConfig[role];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

function RoleSelect({
  value,
  onValueChange,
}: {
  value: MemberRole;
  onValueChange: (role: MemberRole) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="member-role">Role</Label>
      <Select value={value} onValueChange={(nextRole) => onValueChange(nextRole as MemberRole)}>
        <SelectTrigger id="member-role" className="w-full">
          <span>{roleConfig[value].label}</span>
        </SelectTrigger>
        <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
          {EDITABLE_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {roleConfig[role].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Admins can manage workspace members and settings. Members can collaborate on workspace work.
      </p>
    </div>
  );
}

function MemberModal({
  state,
  workspaceId,
  onClose,
}: {
  state: MemberModalState;
  workspaceId: string;
  onClose: () => void;
}) {
  const members = useWorkspaceMembers(workspaceId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>(
    state?.mode === "role" ? state.member.role : "MEMBER",
  );
  const [formError, setFormError] = useState<string | null>(null);

  if (!state) return null;

  const member = state.mode === "invite" ? undefined : state.member;
  const isInvite = state.mode === "invite";
  const isDetails = state.mode === "details";
  const isRemove = state.mode === "remove";
  const isPending =
    members.invite.isPending || members.updateRole.isPending || members.remove.isPending;
  const title = isInvite
    ? "Invite member"
    : isDetails
      ? "Member details"
      : isRemove
        ? "Remove member"
        : "Update member role";
  const description = isInvite
    ? "Send an invitation and set the member's initial access level."
    : isDetails
      ? "Workspace member profile and access details."
    : isRemove
      ? `Remove ${getMemberName(member!)} from this workspace. They will lose access to its projects and boards.`
      : `Update the access level for ${getMemberName(member!)}.`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      if (isInvite) {
        await members.invite.mutateAsync({ workspaceId, email: email.trim(), role });
      } else if (isRemove && member) {
        await members.remove.mutateAsync({ workspaceId, memberId: member._id });
      } else if (member) {
        await members.updateRole.mutateAsync({ workspaceId, memberId: member._id, role });
      }
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-6 py-5 pr-14">
            <DialogTitle className={isRemove ? "text-destructive" : "text-primary"}>
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={isPending}
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
          >
            <X className="size-4" />
          </button>
          <div className="space-y-5 px-6 py-5">
            {isDetails && member && (
              <div className="flex items-center gap-4">
                <UserAvatar name={getMemberName(member)} avatar={member.userId.avatar} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{getMemberName(member)}</p>
                  <p className="truncate text-sm text-muted-foreground">{member.userId.email}</p>
                  <div className="mt-2">
                    <RoleBadge role={member.role} />
                  </div>
                </div>
              </div>
            )}
            {isDetails && member && (
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="mt-1 font-medium">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(member.joinedAt))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Access level</p>
                  <p className="mt-1 font-medium">{roleConfig[member.role].label}</p>
                </div>
              </div>
            )}
            {isInvite && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="teammate@company.com"
                    autoFocus
                    required
                  />
                </div>
                <RoleSelect value={role} onValueChange={setRole} />
              </>
            )}
            {!isInvite && !isDetails && !isRemove && <RoleSelect value={role} onValueChange={setRole} />}
            {formError && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {isDetails ? "Close" : "Cancel"}
            </Button>
            {!isDetails && (
              <Button type="submit" variant={isRemove ? "destructive" : "default"} disabled={isPending}>
                {isPending
                  ? "Saving…"
                  : isInvite
                    ? "Send invitation"
                    : isRemove
                      ? "Remove member"
                      : "Save changes"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberCard({
  member,
  canManage,
  onOpenDetails,
  onEditRole,
  onRemove,
}: {
  member: MemberDoc;
  canManage: boolean;
  onOpenDetails: () => void;
  onEditRole: () => void;
  onRemove: () => void;
}) {
  const name = getMemberName(member);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <UserAvatar name={name} avatar={member.userId.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-foreground">{name}</h2>
            <div className="sm:hidden">
              <RoleBadge role={member.role} />
            </div>
          </div>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{member.userId.email}</span>
            <span className="hidden shrink-0 text-border sm:inline">•</span>
            <span className="hidden shrink-0 sm:inline">
              Joined {new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(member.joinedAt))}
            </span>
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <RoleBadge role={member.role} />
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${name}`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem className="gap-2" onClick={onEditRole}>
                <Pencil className="size-3.5" />
                Edit role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={onRemove}
              >
                <LogOut className="size-3.5" />
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </article>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div className={cn("flex size-8 items-center justify-center rounded-lg", accent)}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function WorkspaceMembers({ workspaceSlug }: { workspaceSlug: string }) {
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspaceBySlug(workspaceSlug);
  const members = useWorkspaceMembers(workspace?._id);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<MemberRole | "ALL">("ALL");
  const [modalState, setModalState] = useState<MemberModalState>(null);
  const workspaceMembers = members.data?.members ?? EMPTY_MEMBERS;
  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return workspaceMembers
      .filter((member) => {
        const matchesSearch =
          !normalizedSearch ||
          `${getMemberName(member)} ${member.userId.email}`.toLowerCase().includes(normalizedSearch);
        return matchesSearch && (roleFilter === "ALL" || member.role === roleFilter);
      })
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  }, [roleFilter, search, workspaceMembers]);

  if (isWorkspaceLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading members…</div>;
  }
  if (!workspace) {
    return <div className="p-8 text-sm text-destructive">Workspace not found or you do not have access.</div>;
  }

  const adminCount = workspaceMembers.filter((member) => member.role === "ADMIN").length;
  const memberCount = workspaceMembers.filter((member) => member.role === "MEMBER").length;
  const canManageMembers =
    workspace.membershipRole === "OWNER" || workspace.membershipRole === "ADMIN";
  const canManageMember = (member: MemberDoc) =>
    (workspace.membershipRole === "OWNER" && member.role !== "OWNER") ||
    (workspace.membershipRole === "ADMIN" && member.role === "MEMBER");

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Members</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage access for <span className="font-medium text-foreground">{workspace.name}</span>
                </p>
              </div>
            </div>
            {canManageMembers && (
              <Button className="gap-2" onClick={() => setModalState({ mode: "invite" })}>
                <UserPlus className="size-4" />
                Invite member
              </Button>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatCard icon={Users} label="Total members" value={workspaceMembers.length} />
            <StatCard icon={Shield} label="Admins" value={adminCount} accent="bg-chart-2/10 text-chart-2" />
            <StatCard icon={User} label="Members" value={memberCount} accent="bg-muted text-muted-foreground" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Workspace members</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {members.isLoading ? "Loading members…" : `${workspaceMembers.length} people with workspace access`}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email…"
                className="h-10 rounded-xl pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as MemberRole | "ALL")}>
              <SelectTrigger aria-label="Filter members by role" className="h-10 w-full gap-2 rounded-xl sm:w-36">
                <ListFilter className="size-3.5 text-muted-foreground" />
                <span>{ROLE_FILTER_OPTIONS.find((option) => option.value === roleFilter)?.label}</span>
              </SelectTrigger>
              <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                {ROLE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!members.isLoading && filteredMembers.length > 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredMembers.length}</span> of{" "}
            <span className="font-medium text-foreground">{workspaceMembers.length}</span> members
          </p>
        )}

        {members.isLoading ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
            Loading members…
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Users className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold">No members found</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {search || roleFilter !== "ALL"
                ? "Try a different search or role filter."
                : "Invite your first team member to get started."}
            </p>
            {canManageMembers && !search && roleFilter === "ALL" && (
              <Button className="mt-5 gap-2" onClick={() => setModalState({ mode: "invite" })}>
                <UserPlus className="size-4" />
                Invite member
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                canManage={canManageMember(member)}
                onOpenDetails={() => setModalState({ mode: "details", member })}
                onEditRole={() => setModalState({ mode: "role", member })}
                onRemove={() => setModalState({ mode: "remove", member })}
              />
            ))}
          </div>
        )}
      </section>

      <MemberModal
        key={modalState ? `${modalState.mode}-${modalState.mode === "invite" ? "new" : modalState.member._id}` : "closed"}
        state={modalState}
        workspaceId={workspace._id}
        onClose={() => setModalState(null)}
      />
    </div>
  );
}
