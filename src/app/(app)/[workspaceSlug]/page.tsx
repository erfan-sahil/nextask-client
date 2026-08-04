import { WorkspacePage } from "@/components/app/workspace/workspace-page";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  return { title: `${workspaceSlug} — NexTask` };
}

export default async function WorkspaceRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  return <WorkspacePage workspaceSlug={workspaceSlug} />;
}
