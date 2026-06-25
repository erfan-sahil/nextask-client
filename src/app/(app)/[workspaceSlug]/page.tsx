import { notFound } from "next/navigation";
import { WorkspacePage } from "@/components/app/workspace/workspace-page";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  return { title: workspace ? `${workspace.name} — NexTask` : "Not Found" };
}

export default async function WorkspaceRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);

  if (!workspace) notFound();

  return <WorkspacePage workspace={workspace} />;
}
