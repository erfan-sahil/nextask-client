import { WorkspaceReports } from "@/components/app/reports/workspace-reports";
import { getWorkspaceForRoute } from "@/lib/mock/workspace-route";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);
  return { title: `Reports · ${workspace.name} — NexTask` };
}

export default async function WorkspaceReportsRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);

  return <WorkspaceReports workspace={workspace} />;
}
