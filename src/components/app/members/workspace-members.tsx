"use client";

import {
  Calendar,
  FolderKanban,
  ListFilter,
  LogOut,
  Mail,
  MoreHorizontal,
  Pencil,
  Search,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { RoleBadge } from "@/components/app/role-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockMembers, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Member, MemberRole, Workspace } from "@/types/workspace";

const ROLE_ORDER: MemberRole[] = ["owner", "admin", "member", "viewer"];

// ─── Member card ─────────────────────────────────────────────────────────────

function MemberCard({
  member,
  projectNames,
}: {
  member: Member;
  projectNames: string[];
}) {
  const visible = projectNames.slice(0, 3);
  const overflow = projectNames.length - visible.length;

  return (
    <div className="group rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      {/* ── Primary row ── */}
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            member.avatarColor,
          )}
        >
          {member.initials}
        </div>

        {/* Name + email */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            {member.name}
          </p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="size-3 shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        </div>

        {/* Role badge — aligned right, vertically centred with avatar */}
        <div className="hidden sm:flex shrink-0">
          <RoleBadge role={member.role} />
        </div>

        {/* Actions — reveal on hover */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100"
            aria-label={`More options for ${member.name}`}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2 text-xs">
              <Pencil className="size-3.5" />
              Edit role
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs">
              <Settings className="size-3.5" />
              Manage access
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
              <LogOut className="size-3.5" />
              Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-border" />

      {/* ── Meta row ── */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Projects */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <FolderKanban className="size-3.5 shrink-0 text-muted-foreground/50" />
          {projectNames.length === 0 ? (
            <span className="text-xs text-muted-foreground/50">No projects</span>
          ) : (
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {visible.map((name) => (
                <span
                  key={name}
                  className="truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {name}
                </span>
              ))}
              {overflow > 0 && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{overflow}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Joined date */}
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>
            {new Date(member.joinedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type FilterRole = "all" | "admin" | "member";

const FILTER_OPTIONS: { value: FilterRole; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admins" },
  { value: "member", label: "Members" },
];

export function WorkspaceMembers({ workspace }: { workspace: Workspace }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterRole>("all");

  const wsMembers = useMemo(
    () => mockMembers.filter((m) => m.workspaceId === workspace.id),
    [workspace.id],
  );

  const filtered = useMemo(() => {
    return wsMembers
      .filter((m) => {
        const matchesSearch =
          search === "" ||
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || m.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  }, [wsMembers, search, roleFilter]);

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of mockProjects) map[p.id] = p.name;
    return map;
  }, []);

  const adminCount = useMemo(
    () => wsMembers.filter((m) => m.role === "admin").length,
    [wsMembers],
  );
  const memberCount = useMemo(
    () => wsMembers.filter((m) => m.role === "member").length,
    [wsMembers],
  );

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      {/* ── Header card ── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 w-full bg-primary" />
        <div className="p-6">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Members</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Manage team access for{" "}
                  <span className="font-medium text-foreground">{workspace.name}</span>
                </p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 gap-2">
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Invite member</span>
              <span className="sm:hidden">Invite</span>
            </Button>
          </div>

          {/* Stat chips */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Total</p>
                <p className="text-sm font-semibold text-foreground">{wsMembers.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
                <Shield className="size-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Admins</p>
                <p className="text-sm font-semibold text-foreground">{adminCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <User className="size-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Members</p>
                <p className="text-sm font-semibold text-foreground">{memberCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + filter ── */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-72 sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as FilterRole)}>
          <SelectTrigger className="w-40 gap-2">
            <ListFilter className="size-3.5 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
            {FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── List count ── */}
      {filtered.length > 0 && (
        <p className="mb-3 text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          <span className="font-medium text-foreground">{wsMembers.length}</span> members
        </p>
      )}

      {/* ── Member list / empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-20 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Users className="size-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No members found</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {search
              ? "Try adjusting your search or filter to find who you're looking for."
              : "Invite your first team member to get started."}
          </p>
          {!search && roleFilter === "all" && (
            <Button size="sm" className="mt-5 gap-2">
              <UserPlus className="size-4" />
              Invite member
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              projectNames={member.projectIds.map((id) => projectMap[id] ?? id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
