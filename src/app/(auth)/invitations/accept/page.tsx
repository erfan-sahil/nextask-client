"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { workflowApi } from "@/lib/api/workflow";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { authRoutes, appRoutes } from "@/config/navigation";

function WorkspaceInvitationAcceptContent() {
  const token = useSearchParams().get("token") ?? "";
  const preview = useQuery({
    queryKey: ["workspace-invitation", token],
    queryFn: () => workflowApi.previewWorkspaceInvitation(token),
    enabled: Boolean(token),
  });
  const accept = useMutation({
    mutationFn: () => workflowApi.acceptWorkspaceInvitation(token),
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">NexTask invitation</p>
        <h1 className="mt-2 text-2xl font-bold">Join a workspace</h1>
        {preview.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading invitation…</p>}
        {preview.error && <p className="mt-4 text-sm text-destructive">{getErrorMessage(preview.error)}</p>}
        {Boolean(preview.data) && <p className="mt-4 text-sm text-muted-foreground">You were invited to <strong className="text-foreground">{String((preview.data as { invitation?: { workspace?: { name?: string } } }).invitation?.workspace?.name ?? "a workspace")}</strong>. Sign in with the invited email, then accept to join.</p>}
        <div className="mt-6 flex gap-3">
          <button disabled={!token || accept.isPending} onClick={() => accept.mutate()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Accept invitation</button>
          <Link href={`${authRoutes.login}?callbackUrl=${encodeURIComponent(`/invitations/accept?token=${token}`)}`} className="rounded-xl border border-border px-4 py-2 text-sm">Sign in</Link>
        </div>
        {accept.error && <p className="mt-4 text-sm text-destructive">{getErrorMessage(accept.error)}</p>}
        {accept.isSuccess && <Link href={appRoutes.workspaces} className="mt-4 inline-block text-sm font-medium text-primary">Open workspaces →</Link>}
      </section>
    </main>
  );
}

export default function WorkspaceInvitationAcceptPage() {
  return (
    <Suspense fallback={<main className="p-8 text-sm text-muted-foreground">Loading invitation…</main>}>
      <WorkspaceInvitationAcceptContent />
    </Suspense>
  );
}
