import { mockWorkspaces } from "@/lib/mock/dashboard-data";
import type { Workspace } from "@/types/workspace";

function formatWorkspaceName(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getWorkspaceForRoute(slug: string): Workspace {
  const mockWorkspace = mockWorkspaces.find(
    (workspace) => workspace.slug === slug,
  );

  if (mockWorkspace) {
    return mockWorkspace;
  }

  const name = formatWorkspaceName(slug) || "Workspace";

  return {
    id: slug,
    name,
    slug,
    description: "",
    memberCount: 0,
    projectCount: 0,
    color: "bg-primary/10 text-primary",
    initials: name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}
