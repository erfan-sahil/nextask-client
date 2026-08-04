"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  memberInviteFormSchema,
  type MemberInviteFormValues,
} from "@/lib/validations/member";
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
  const [formError, setFormError] = useState<string | null>(null);
  const isPending = members.invite.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  useEffect(() => {
    if (!isOpen) return;
    reset({ email: "", role: "MEMBER" });
    setFormError(null);
  }, [isOpen, reset]);

  function closeModal() {
    if (isPending) return;
    setFormError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: MemberInviteFormValues) {
    setFormError(null);

    try {
      await members.invite.mutateAsync({
        workspaceId,
        projectId,
        email: values.email.trim(),
        role: values.role,
      });
      reset({ email: "", role: "MEMBER" });
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AppModalHeader
            title="Invite to project"
            description={`Send an invitation to join ${projectName} with project-specific access.`}
            icon={UserPlus}
            onClose={closeModal}
            closeLabel="Close invite dialog"
            disabled={isPending}
          />

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="project-member-email">Email address</Label>
              <Input
                id="project-member-email"
                type="email"
                placeholder="teammate@company.com"
                autoFocus
                disabled={isPending}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-member-role">Project role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="project-member-role"
                      className="w-full cursor-pointer"
                    >
                      <span>{field.value === "ADMIN" ? "Admin" : "Member"}</span>
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      align="start"
                      alignItemWithTrigger={false}
                    >
                      {ASSIGNABLE_ROLES.map((assignableRole) => (
                        <SelectItem key={assignableRole} value={assignableRole}>
                          {assignableRole === "ADMIN" ? "Admin" : "Member"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
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
            <Button type="submit" disabled={isPending || !emailValue?.trim()}>
              {isPending ? "Sending…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
