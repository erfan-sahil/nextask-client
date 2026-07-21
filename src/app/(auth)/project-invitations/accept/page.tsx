"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authRoutes, appRoutes } from "@/config/navigation";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { workflowApi } from "@/lib/api/workflow";

function ProjectInvitationAcceptContent() {
  const token = useSearchParams().get("token") ?? "";
  const preview = useQuery({
    queryKey: ["project-invitation", token],
    queryFn: () => workflowApi.previewProjectInvitation(token),
    enabled: Boolean(token),
  });
  const accept = useMutation({ mutationFn: () => workflowApi.acceptProjectInvitation(token) });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">NexTask invitation</p>
        <h1 className="mt-2 text-2xl font-bold">Join a project</h1>
        {preview.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading invitation…</p>}
        {preview.error && <p className="mt-4 text-sm text-destructive">{getErrorMessage(preview.error)}</p>}
        {Boolean(preview.data) && <p className="mt-4 text-sm text-muted-foreground">You were invited to <strong className="text-foreground">{String((preview.data as { invitation?: { project?: { name?: string } } }).invitation?.project?.name ?? "a project")}</strong>. Accept with the invited email to get project-only access.</p>}
        <div className="mt-6 flex gap-3"><button disabled={!token || accept.isPending} onClick={() => accept.mutate()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Accept invitation</button><Link href={`${authRoutes.login}?callbackUrl=${encodeURIComponent(`/project-invitations/accept?token=${token}`)}`} className="rounded-xl border border-border px-4 py-2 text-sm">Sign in</Link></div>
        {accept.error && <p className="mt-4 text-sm text-destructive">{getErrorMessage(accept.error)}</p>}
        {accept.isSuccess && <Link href={appRoutes.workspaces} className="mt-4 inline-block text-sm font-medium text-primary">Open workspaces →</Link>}
      </section>
    </main>
  );
}

export default function ProjectInvitationAcceptPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-muted-foreground">Loading invitation…</main>}>
      <ProjectInvitationAcceptContent />
    </Suspense>
  );
}
