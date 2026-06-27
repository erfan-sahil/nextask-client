"use client";

import { Mail, MoreHorizontal, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockMembers, mockProjects } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";
import type { Member, MemberRole, Workspace } from "@/types/workspace";

const ROLE_CONFIG: Record<MemberRole, { label: string; className: string }> = {
  owner: {
    label: "Owner",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  admin: {
    label: "Admin",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  member: {
    label: "Member",
    className: "bg-muted text-muted-foreground border-border",
  },
  viewer: {
    label: "Viewer",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
};

const ROLE_ORDER: MemberRole[] = ["owner", "admin", "member", "viewer"];

function MemberRow({ member, projectNames }: { member: Member; projectNames: string[] }) {
  const roleConfig = ROLE_CONFIG[member.role];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      {/* Avatar */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          member.avatarColor,
        )}
      >
        {member.initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{member.name}</p>
          <Badge
            variant="outline"
            className={cn("px-2 py-0 text-[11px] font-medium", roleConfig.className)}
          >
            {roleConfig.label}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="size-3 shrink-0" />
          <span className="truncate">{member.email}</span>
        </div>
      </div>

      {/* Projects */}
      <div className="hidden min-w-0 max-w-48 flex-col gap-1 md:flex">
        <p className="text-xs font-medium text-muted-foreground">Projects</p>
        {projectNames.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">None</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {projectNames.map((name) => (
              <span
                key={name}
                className="truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Joined */}
      <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
        <p className="text-xs text-muted-foreground">Joined</p>
        <p className="text-xs font-medium">
          {new Date(member.joinedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <button
        type="button"
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`More options for ${member.name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  );
}

type FilterRole = MemberRole | "all";

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
      .sort(
        (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
      );
  }, [wsMembers, search, roleFilter]);

  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of mockProjects) map[p.id] = p.name;
    return map;
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: wsMembers.length };
    for (const m of wsMembers) {
      counts[m.role] = (counts[m.role] ?? 0) + 1;
    }
    return counts;
  }, [wsMembers]);

  const filterOptions: { value: FilterRole; label: string }[] = [
    { value: "all", label: "All" },
    { value: "owner", label: "Owners" },
    { value: "admin", label: "Admins" },
    { value: "member", label: "Members" },
    { value: "viewer", label: "Viewers" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {wsMembers.length} member{wsMembers.length !== 1 ? "s" : ""} in{" "}
            <span className="font-medium text-foreground">{workspace.name}</span> · Access all projects in this workspace
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" />
          Invite member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ROLE_ORDER.map((role) => {
          const cfg = ROLE_CONFIG[role];
          const count = roleCounts[role] ?? 0;
          return (
            <div
              key={role}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{cfg.label}{count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                roleFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
              {roleCounts[opt.value] !== undefined && (
                <span className="ml-1.5 opacity-70">
                  {roleCounts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Member list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium">No members found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => (
            <MemberRow
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
