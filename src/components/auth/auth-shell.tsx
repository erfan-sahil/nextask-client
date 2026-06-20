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
  );
}
