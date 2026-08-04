import { WorkspaceGoals } from "@/components/app/goals/workspace-goals";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  return { title: `Goals · ${workspaceSlug} — NexTask` };
}

export default async function WorkspaceGoalsRoute({ params }: Props) {
  const { workspaceSlug } = await params;

  return <WorkspaceGoals workspaceSlug={workspaceSlug} />;
}
