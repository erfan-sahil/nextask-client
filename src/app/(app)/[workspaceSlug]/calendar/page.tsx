import { notFound } from "next/navigation";
import { WorkspaceCalendar } from "@/components/app/calendar/workspace-calendar";
import { mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  return { title: workspace ? `Calendar · ${workspace.name} — NexTask` : "Not Found" };
}

export default async function WorkspaceCalendarRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);

  if (!workspace) notFound();

  return <WorkspaceCalendar workspace={workspace} />;
}
