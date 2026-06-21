import { AuthHeader } from "@/components/layout/auth-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-primary-light/50 blur-3xl dark:bg-primary/10" />
        <div className="absolute -bottom-40 -left-32 size-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary-light/20" />
        <div className="absolute top-1/3 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary-light/30 blur-3xl dark:bg-primary/5" />
      </div>

      <AuthHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        {children}
      </main>
    </div>
  );
}
