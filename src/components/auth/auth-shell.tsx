import { AuthBadge } from "@/components/auth/auth-badge";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";

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
    <div className={cn("relative w-full", wide ? "max-w-xl" : "max-w-md")}>
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <SiteLogo size="lg" priority className="mb-6" />

          {badge ? <AuthBadge>{badge}</AuthBadge> : null}

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
