import { WorkspaceGoals } from "@/components/app/goals/workspace-goals";
import { getWorkspaceForRoute } from "@/lib/mock/workspace-route";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);
  return { title: `Goals · ${workspace.name} — NexTask` };
}

export default async function WorkspaceGoalsRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);

  return <WorkspaceGoals workspace={workspace} />;
}
