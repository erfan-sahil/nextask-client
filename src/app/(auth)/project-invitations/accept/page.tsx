import { Suspense } from "react";
import { ProjectInvitationAcceptContent } from "./project-invitation-accept-content";

export default function ProjectInvitationAcceptPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8 text-sm text-muted-foreground">
          Loading invitation…
        </main>
      }
    >
      <ProjectInvitationAcceptContent />
    </Suspense>
  );
}
