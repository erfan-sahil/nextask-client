import { WorkspaceReports } from "@/components/app/reports/workspace-reports";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  return { title: `Reports · ${workspaceSlug} — NexTask` };
}

export default async function WorkspaceReportsRoute({ params }: Props) {
  const { workspaceSlug } = await params;

  return <WorkspaceReports workspaceSlug={workspaceSlug} />;
}
