import { notFound } from "next/navigation";
import { BoardPage } from "@/components/app/board/board-page";
import { mockBoard, mockProjects, mockWorkspaces } from "@/lib/mock/dashboard-data";

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string; boardId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { boardId } = await params;
  // For now return the mock board name; future: query by boardId
  return { title: `${mockBoard.name} — NexTask` };
}

export default async function BoardRoute({ params }: Props) {
  const { workspaceSlug, projectId, boardId } = await params;

  const workspace = mockWorkspaces.find((w) => w.slug === workspaceSlug);
  const project = mockProjects.find((p) => p.id === projectId);

  if (!workspace || !project) notFound();

  // Use the single full mockBoard for now; filtered by boardId in the future
  const board = mockBoard.id === boardId ? mockBoard : { ...mockBoard, id: boardId };

  return <BoardPage workspace={workspace} project={project} board={board} />;
}
