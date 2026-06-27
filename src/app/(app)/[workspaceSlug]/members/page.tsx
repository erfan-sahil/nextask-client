import { notFound } from "next/navigation";
import { WorkspaceMembers } from "@/components/app/members/workspace-members";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  return { title: workspace ? `Members · ${workspace.name} — NexTask` : "Not Found" };
}

export default async function WorkspaceMembersRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);

  if (!workspace) notFound();

  return <WorkspaceMembers workspace={workspace} />;
}
