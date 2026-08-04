"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Crown,
  ListFilter,
  Loader2,
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
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
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
import {
  memberInviteFormSchema,
  type MemberInviteFormValues,
} from "@/lib/validations/member";
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
  {
    label: string;
    className: string;
    detailsClass: string;
    icon: React.ElementType;
  }
> = {
  OWNER: {
    label: "Owner",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    detailsClass: "bg-amber-500/10 text-amber-800 dark:text-amber-200",
    icon: Crown,
  },
  ADMIN: {
    label: "Admin",
    className:
      "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    detailsClass: "bg-violet-500/10 text-violet-800 dark:text-violet-200",
    icon: Shield,
  },
  MEMBER: {
    label: "Member",
    className: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    detailsClass: "bg-sky-500/10 text-sky-800 dark:text-sky-200",
    icon: User,
  },
};

type MemberModalState =
  | { mode: "invite" }
  | { mode: "details" | "role" | "remove"; member: MemberDoc }
  | null;

function getMemberName(member: MemberDoc) {
  return (
    `${member.userId.firstName} ${member.userId.lastName}`.trim() ||
    member.userId.email
  );
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
      <Select
        value={value}
        onValueChange={(nextRole) => onValueChange(nextRole as MemberRole)}
      >
        <SelectTrigger id="member-role" className="w-full cursor-pointer">
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
        Admins can manage workspace members and settings. Members can
        collaborate on workspace work.
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
  const [role, setRole] = useState<MemberRole>(
    state?.mode === "role" ? state.member.role : "MEMBER",
  );
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleInviteSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MemberInviteFormValues>({
    resolver: zodResolver(memberInviteFormSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const emailValue = watch("email");

  if (!state) return null;

  const member = state.mode === "invite" ? undefined : state.member;
  const isInvite = state.mode === "invite";
  const isDetails = state.mode === "details";
  const isRemove = state.mode === "remove";
  const detailsConfig = member ? roleConfig[member.role] : null;
  const RoleIcon = detailsConfig?.icon;
  const isPending =
    members.invite.isPending ||
    members.updateRole.isPending ||
    members.remove.isPending;
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

  async function onInviteSubmit(values: MemberInviteFormValues) {
    setFormError(null);

    try {
      await members.invite.mutateAsync({
        workspaceId,
        email: values.email.trim(),
        role: values.role,
      });
      onClose();
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (isInvite) {
      await handleInviteSubmit(onInviteSubmit)(event);
      return;
    }

    event.preventDefault();
    setFormError(null);

    try {
      if (isRemove && member) {
        await members.remove.mutateAsync({ workspaceId, memberId: member._id });
      } else if (member) {
        await members.updateRole.mutateAsync({
          workspaceId,
          memberId: member._id,
          role,
        });
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
          {isDetails && member && detailsConfig && RoleIcon ? (
            <DialogHeader
              className={cn(
                "relative gap-4 p-6 pb-5",
                detailsConfig.detailsClass,
              )}
            >
              <button
                type="button"
                aria-label="Close member details"
                onClick={onClose}
                className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-current/70 transition-colors hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={getMemberName(member)}
                  avatar={member.userId.avatar}
                  size="lg"
                />
                <div className="min-w-0 pr-8">
                  <DialogDescription className="font-medium text-current/75">
                    Member profile
                  </DialogDescription>
                  <DialogTitle className="mt-1 truncate text-xl leading-tight">
                    {getMemberName(member)}
                  </DialogTitle>
                  <div className="mt-2">
                    <RoleBadge role={member.role} />
                  </div>
                </div>
              </div>
            </DialogHeader>
          ) : (
            <AppModalHeader
              title={title}
              description={description}
              icon={isRemove ? LogOut : UserPlus}
              tone={isRemove ? "destructive" : "default"}
              onClose={onClose}
              closeLabel="Close dialog"
              disabled={isPending}
            />
          )}
          <div className="space-y-5 px-6 py-5">
            {isDetails && member && (
              <div className="space-y-3">
                <MemberDetailRow
                  icon={Mail}
                  label="Email address"
                  value={member.userId.email}
                  accent="bg-blue-500/10 text-blue-700 dark:text-blue-300"
                />
                <MemberDetailRow
                  icon={CalendarDays}
                  label="Joined workspace"
                  value={new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(member.joinedAt))}
                  accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                />
                <MemberDetailRow
                  icon={RoleIcon!}
                  label="Access level"
                  value={roleConfig[member.role].label}
                  accent={detailsConfig!.detailsClass}
                />
              </div>
            )}
            {isInvite && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="member-email">Email address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    placeholder="teammate@company.com"
                    autoFocus
                    disabled={isPending}
                    aria-invalid={Boolean(errors.email)}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <RoleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </>
            )}
            {!isInvite && !isDetails && !isRemove && (
              <RoleSelect value={role} onValueChange={setRole} />
            )}
            {formError && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>
          {!isDetails && (
            <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isRemove ? "destructive" : "default"}
                disabled={
                  isPending || (isInvite && !emailValue?.trim())
                }
              >
                {isPending
                  ? "Saving…"
                  : isInvite
                    ? "Send invitation"
                    : isRemove
                      ? "Remove member"
                      : "Save changes"}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MemberDetailRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3.5">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          accent,
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="pt-0.5 text-xs font-medium text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 wrap-break-word text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  );
}

function MemberCard({
  member,
  canUpdateRole,
  canRemove,
  onOpenDetails,
  onEditRole,
  onRemove,
}: {
  member: MemberDoc;
  canUpdateRole: boolean;
  canRemove: boolean;
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
      className="group cursor-pointer rounded-2xl border border-border bg-card transition-all duration-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <UserAvatar name={name} avatar={member.userId.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {name}
            </h2>
            <div className="w-19 shrink-0 text-right sm:hidden">
              <RoleBadge role={member.role} />
            </div>
          </div>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{member.userId.email}</span>
            <span className="hidden shrink-0 text-border sm:inline">•</span>
            <span className="hidden shrink-0 sm:inline">
              Joined{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                year: "numeric",
              }).format(new Date(member.joinedAt))}
            </span>
          </p>
        </div>
        <div className="hidden w-24 shrink-0 text-center sm:block">
          <RoleBadge role={member.role} />
        </div>
        {(canUpdateRole || canRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${name}`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-emerald-500/5 hover:text-foreground"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {canUpdateRole && (
                <DropdownMenuItem
                  className="gap-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEditRole();
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit role
                </DropdownMenuItem>
              )}
              {canUpdateRole && canRemove && <DropdownMenuSeparator />}
              {canRemove && (
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove();
                  }}
                >
                  <LogOut className="size-3.5" />
                  Remove member
                </DropdownMenuItem>
              )}
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
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          accent,
        )}
      >
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
  const { workspace, isLoading: isWorkspaceLoading } =
    useWorkspaceBySlug(workspaceSlug);
  const members = useWorkspaceMembers(workspace?._id);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<MemberRole | "ALL">("ALL");
  const [modalState, setModalState] = useState<MemberModalState>(null);
  const workspaceMembers = members.data?.members ?? EMPTY_MEMBERS;
  const isSearching = search.trim() !== debouncedSearch.trim();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return workspaceMembers
      .filter((member) => {
        const matchesSearch =
          !normalizedSearch ||
          `${getMemberName(member)} ${member.userId.email}`
            .toLowerCase()
            .includes(normalizedSearch);
        return (
          matchesSearch && (roleFilter === "ALL" || member.role === roleFilter)
        );
      })
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  }, [roleFilter, debouncedSearch, workspaceMembers]);

  if (isWorkspaceLoading) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Loading members…</div>
    );
  }
  if (!workspace) {
    return (
      <div className="p-8 text-sm text-destructive">
        Workspace not found or you do not have access.
      </div>
    );
  }

  const adminCount = workspaceMembers.filter(
    (member) => member.role === "ADMIN",
  ).length;
  const memberCount = workspaceMembers.filter(
    (member) => member.role === "MEMBER",
  ).length;
  const canManageMembers =
    workspace.membershipRole === "OWNER" ||
    workspace.membershipRole === "ADMIN";
  const canUpdateMemberRole = (member: MemberDoc) =>
    workspace.membershipRole === "OWNER" && member.role !== "OWNER";
  const canRemoveMember = (member: MemberDoc) =>
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
                  Manage access for{" "}
                  <span className="font-medium text-foreground">
                    {workspace.name}
                  </span>
                </p>
              </div>
            </div>
            {canManageMembers && (
              <Button
                size="page"
                onClick={() => setModalState({ mode: "invite" })}
              >
                <UserPlus className="size-4" />
                Invite member
              </Button>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <StatCard
              icon={Users}
              label="Total members"
              value={workspaceMembers.length}
            />
            <StatCard
              icon={Shield}
              label="Admins"
              value={adminCount}
              accent="bg-chart-2/10 text-chart-2"
            />
            <StatCard
              icon={User}
              label="Members"
              value={memberCount}
              accent="bg-muted text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Workspace members</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {members.isLoading
                ? "Loading members…"
                : `${workspaceMembers.length} people with workspace access`}
            </p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-72">
              {isSearching ? (
                <Loader2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
              ) : (
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email…"
                className="h-10 rounded-lg border-0 bg-transparent pl-9 shadow-none focus-visible:ring-1"
                aria-busy={isSearching}
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter(value as MemberRole | "ALL")
              }
            >
              <SelectTrigger
                aria-label="Filter members by role"
                className="h-10 w-full cursor-pointer gap-2 rounded-lg bg-muted/70 sm:w-40"
              >
                <ListFilter className="size-3.5 text-muted-foreground" />
                <span>
                  {
                    ROLE_FILTER_OPTIONS.find(
                      (option) => option.value === roleFilter,
                    )?.label
                  }
                </span>
              </SelectTrigger>
              <SelectContent
                side="bottom"
                align="start"
                alignItemWithTrigger={false}
              >
                {ROLE_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!members.isLoading && !isSearching && filteredMembers.length > 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredMembers.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {workspaceMembers.length}
            </span>{" "}
            members
          </p>
        )}

        {members.isLoading || isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 text-sm text-muted-foreground">
            <Loader2 className="mb-3 size-5 animate-spin text-primary" />
            {isSearching ? "Searching members…" : "Loading members…"}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Users className="size-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-semibold">No members found</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              {debouncedSearch || roleFilter !== "ALL"
                ? "Try a different search or role filter."
                : "Invite your first team member to get started."}
            </p>
            {canManageMembers && !debouncedSearch && roleFilter === "ALL" && (
              <Button
                className="mt-5 gap-2"
                onClick={() => setModalState({ mode: "invite" })}
              >
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
                canUpdateRole={canUpdateMemberRole(member)}
                canRemove={canRemoveMember(member)}
                onOpenDetails={() => setModalState({ mode: "details", member })}
                onEditRole={() => setModalState({ mode: "role", member })}
                onRemove={() => setModalState({ mode: "remove", member })}
              />
            ))}
          </div>
        )}
      </section>

      <MemberModal
        key={
          modalState
            ? `${modalState.mode}-${modalState.mode === "invite" ? "new" : modalState.member._id}`
            : "closed"
        }
        state={modalState}
        workspaceId={workspace._id}
        onClose={() => setModalState(null)}
      />
    </div>
  );
}
