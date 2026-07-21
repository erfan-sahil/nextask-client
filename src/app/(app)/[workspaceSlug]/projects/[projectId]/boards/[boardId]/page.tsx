import { BoardPage } from "@/components/app/board/board-page";

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string; boardId: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { boardId } = await params;
  return { title: `${boardId} — NexTask` };
}

export default async function BoardRoute({ params }: Props) {
  const { workspaceSlug, projectId, boardId } = await params;
  return (
    <BoardPage
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      boardId={boardId}
    />
  );
}
