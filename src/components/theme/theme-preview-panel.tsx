type ThemePreviewPanelProps = {
  mode: "light" | "dark";
};

export function ThemePreviewPanel({ mode }: ThemePreviewPanelProps) {
  const themeClass = mode === "light" ? "theme-light" : "theme-dark";

  return (
    <div
      className={`${themeClass} flex min-h-[640px] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-sm`}
    >
      <div className="border-b border-border px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {mode} mode
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <header className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <span className="text-lg font-bold text-primary">NexTask</span>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Get started
          </span>
        </header>

        <div className="space-y-6">
          <div>
            <span className="mb-3 inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
              Task management made simple
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Organize your work with{" "}
              <span className="text-primary">NexTask</span>
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              A clean and focused way to manage your tasks and stay productive.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Primary button
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-card-foreground transition-colors hover:bg-emerald-500/5 hover:text-primary dark:hover:bg-emerald-400/10"
            >
              Secondary button
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-2 block text-xs font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              readOnly
              value="you@example.com"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <p className="rounded-xl border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary">
            Verification code sent successfully.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="font-medium text-foreground">Background</p>
              <p className="mt-1 text-muted-foreground">Page surface</p>
            </div>
            <div className="rounded-lg border border-primary-muted bg-primary-light p-3">
              <p className="font-medium text-primary">Primary light</p>
              <p className="mt-1 text-primary/80">Accent surface</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
