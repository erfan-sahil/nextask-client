import { Suspense } from "react";
import { AuthLayoutShell } from "@/components/auth/auth-layout-shell";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-svh flex-col overflow-hidden">
          <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
            <div
              className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
              aria-label="Loading"
            />
          </main>
        </div>
      }
    >
      <AuthLayoutShell>{children}</AuthLayoutShell>
    </Suspense>
  );
}
