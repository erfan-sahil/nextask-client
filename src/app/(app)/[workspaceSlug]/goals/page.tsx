import { notFound } from "next/navigation";
import { WorkspaceGoals } from "@/components/app/goals/workspace-goals";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  return { title: workspace ? `Goals · ${workspace.name} — NexTask` : "Not Found" };
}

export default async function WorkspaceGoalsRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);

  if (!workspace) notFound();

  return <WorkspaceGoals workspace={workspace} />;
}
