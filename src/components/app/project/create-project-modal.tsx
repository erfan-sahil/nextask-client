"use client";

import { ProjectModal } from "@/components/app/project/project-modal";

type CreateProjectModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  workspaceId: string;
  workspaceName: string;
};

export function CreateProjectModal({
  isOpen,
  onOpenChange,
  workspaceId,
  workspaceName,
}: CreateProjectModalProps) {
  return (
    <ProjectModal
      key={isOpen ? "create-open" : "create-closed"}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      mode="create"
    />
  );
}
