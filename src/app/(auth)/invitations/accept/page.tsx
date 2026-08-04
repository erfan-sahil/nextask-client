import { Suspense } from "react";
import { WorkspaceInvitationAcceptContent } from "./workspace-invitation-accept-content";

export default function WorkspaceInvitationAcceptPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8 text-sm text-muted-foreground">
          Loading invitation…
        </main>
      }
    >
      <WorkspaceInvitationAcceptContent />
    </Suspense>
  );
}
