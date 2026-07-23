"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useProjectMembers } from "@/hooks/use-workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import type { MemberRole } from "@/types/domain";

const ASSIGNABLE_ROLES: MemberRole[] = ["MEMBER", "ADMIN"];

type ProjectMemberInviteModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  projectId: string;
  projectName: string;
};

export function ProjectMemberInviteModal({
  isOpen,
  onOpenChange,
  workspaceId,
  projectId,
  projectName,
}: ProjectMemberInviteModalProps) {
  const members = useProjectMembers(workspaceId, projectId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("MEMBER");
  const [formError, setFormError] = useState<string | null>(null);
  const isPending = members.invite.isPending;

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    try {
      await members.invite.mutateAsync({
        workspaceId,
        projectId,
        email: email.trim(),
        role,
      });
      setEmail("");
      setRole("MEMBER");
      onOpenChange(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeModal();
      }}
    >
      <DialogContent className="max-w-md overflow-hidden p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative border-b border-border px-6 py-5 pr-14">
            <DialogTitle className="text-primary">Invite to project</DialogTitle>
            <DialogDescription>
              Send an invitation to join {projectName} with project-specific access.
            </DialogDescription>
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close invite dialog"
              disabled={isPending}
            >
              <X className="size-4" />
            </button>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="project-member-email">Email address</Label>
              <Input
                id="project-member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@company.com"
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-member-role">Project role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
                <SelectTrigger id="project-member-role" className="w-full cursor-pointer">
                  <span>{role === "ADMIN" ? "Admin" : "Member"}</span>
                </SelectTrigger>
                <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
                  {ASSIGNABLE_ROLES.map((assignableRole) => (
                    <SelectItem key={assignableRole} value={assignableRole}>
                      {assignableRole === "ADMIN" ? "Admin" : "Member"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Admins can manage project members. Members can collaborate only in this project.
              </p>
            </div>

            {formError && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !email.trim()}>
              {isPending ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
