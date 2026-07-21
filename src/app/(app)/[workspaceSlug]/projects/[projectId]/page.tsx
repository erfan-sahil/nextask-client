import { ProjectPage } from "@/components/app/project/project-page";

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  return { title: `${projectId} — NexTask` };
}

export default async function ProjectRoute({ params }: Props) {
  const { workspaceSlug, projectId } = await params;
  return <ProjectPage workspaceSlug={workspaceSlug} projectId={projectId} />;
}
