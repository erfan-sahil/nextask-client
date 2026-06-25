import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/app/project/project-page";
import { mockProjects, mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { projectId } = await params;
  const project = mockProjects.find((p) => p.id === projectId);
  return { title: project ? `${project.name} — NexTask` : "Not Found" };
}

export default async function ProjectRoute({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  const project = mockProjects.find((p) => p.id === projectId);

  if (!workspace || !project) notFound();

  return <ProjectPage workspace={workspace} project={project} />;
}
