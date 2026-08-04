import { WorkspaceMembers } from "@/components/app/members/workspace-members";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  return { title: `Members · ${workspaceSlug} — NexTask` };
}

export default async function WorkspaceMembersRoute({ params }: Props) {
  const { workspaceSlug } = await params;

  return <WorkspaceMembers workspaceSlug={workspaceSlug} />;
}
