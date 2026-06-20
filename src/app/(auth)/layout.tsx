import { AuthHeader } from "@/components/layout/auth-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}
