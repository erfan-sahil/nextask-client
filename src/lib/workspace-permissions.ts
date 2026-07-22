import type { MemberRole } from "@/types/domain";

export function canManageWorkspaceContent(role: MemberRole | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
