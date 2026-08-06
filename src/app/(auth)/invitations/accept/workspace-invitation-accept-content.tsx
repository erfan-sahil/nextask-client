"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getErrorMessage } from "@/lib/api/get-error-message";
import { authRoutes, appRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspaceInvitation } from "@/hooks/use-invitations";

type InvitationPreview = {
  invitation?: {
    email?: string;
    workspace?: { name?: string };
  };
};

function buildAuthHref(path: string, token: string) {
  const callbackUrl = `/invitations/accept?token=${token}`;
  const params = new URLSearchParams({
    callbackUrl,
    switchAccount: "1",
  });
  return `${path}?${params.toString()}`;
}

export function WorkspaceInvitationAcceptContent() {
  const token = useSearchParams().get("token") ?? "";
  const { accept, preview } = useWorkspaceInvitation(token);
  const { user, isLoading: isAuthLoading, logout, isLoggingOut } = useAuth();

  const invitation = (preview.data as InvitationPreview | undefined)?.invitation;
  const invitedEmail = invitation?.email?.toLowerCase() ?? "";
  const signedInEmail = user?.email?.toLowerCase() ?? "";
  const isWrongAccount =
    Boolean(user && invitedEmail) && signedInEmail !== invitedEmail;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4">
      <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-primary">NexTask invitation</p>
        <h1 className="mt-2 text-2xl font-bold">Join a workspace</h1>
        {preview.isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">Loading invitation…</p>
        )}
        {preview.error && (
          <p className="mt-4 text-sm text-destructive">
            {getErrorMessage(preview.error)}
          </p>
        )}
        {Boolean(invitation) && (
          <p className="mt-4 text-sm text-muted-foreground">
            You were invited to{" "}
            <strong className="text-foreground">
              {invitation?.workspace?.name ?? "a workspace"}
            </strong>
            {invitedEmail ? (
              <>
                {" "}
                as <strong className="text-foreground">{invitedEmail}</strong>
              </>
            ) : null}
            . Sign in with that email, then accept to join.
          </p>
        )}
        {!isAuthLoading && user ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Signed in as{" "}
            <strong className="text-foreground">{user.email}</strong>
            {isWrongAccount
              ? ". This account does not match the invited email."
              : null}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            disabled={!token || accept.isPending || isWrongAccount}
            onClick={() => accept.mutate()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            Accept invitation
          </button>
          {!isAuthLoading && user ? (
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => {
                const callbackUrl = `/invitations/accept?token=${token}`;
                logout(
                  `${authRoutes.login}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
                );
              }}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              {isLoggingOut ? "Signing out…" : "Use a different account"}
            </button>
          ) : null}
          {!isAuthLoading && !user ? (
            <>
              <Link
                href={buildAuthHref(authRoutes.login, token)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Sign in
              </Link>
              <Link
                href={buildAuthHref(authRoutes.register, token)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Create account
              </Link>
            </>
          ) : null}
        </div>
        {accept.error && (
          <p className="mt-4 text-sm text-destructive">
            {getErrorMessage(accept.error)}
          </p>
        )}
        {accept.isSuccess && (
          <Link
            href={appRoutes.workspaces}
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            Open workspaces →
          </Link>
        )}
      </section>
    </main>
  );
}
