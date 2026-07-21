import { WorkspaceCalendar } from "@/components/app/calendar/workspace-calendar";
import { getWorkspaceForRoute } from "@/lib/mock/workspace-route";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);
  return { title: `Calendar · ${workspace.name} — NexTask` };
}

export default async function WorkspaceCalendarRoute({ params }: Props) {
  const { workspaceSlug } = await params;
  const workspace = getWorkspaceForRoute(workspaceSlug);

  return <WorkspaceCalendar workspace={workspace} />;
}
