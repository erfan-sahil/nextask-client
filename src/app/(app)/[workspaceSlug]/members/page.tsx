import { WorkspaceMembers } from "@/components/app/members/workspace-members";
import { getWorkspaceForRoute } from "@/lib/mock/workspace-route";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);
  return { title: `Members · ${workspace.name} — NexTask` };
}

export default async function WorkspaceMembersRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);

  return <WorkspaceMembers workspace={workspace} />;
}
