import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type AuthShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
  wide?: boolean;
};

export function AuthShell({
  title,
  description,
  children,
  badge,
  wide = false,
}: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            NexTask
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className={`w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            {badge ? (
              <span className="mb-4 inline-flex rounded-full bg-primary-light px-4 py-1 text-sm font-medium text-primary">
                {badge}
              </span>
            ) : null}

            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
