import { notFound } from "next/navigation";
import { WorkspaceReports } from "@/components/app/reports/workspace-reports";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  return { title: workspace ? `Reports · ${workspace.name} — NexTask` : "Not Found" };
}

export default async function WorkspaceReportsRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);

  if (!workspace) notFound();

  return <WorkspaceReports workspace={workspace} />;
}
