import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/auth";

type WelcomeHeaderProps = {
  user: User;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary-light/60 blur-3xl dark:bg-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-40 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge
            variant="secondary"
            className="mb-4 rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-primary"
          >
            <Sparkles data-icon="inline-start" />
            Your workspace overview
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {user.firstName}
          </h2>
          <p className="mt-2 max-w-xl text-base leading-7 text-muted-foreground">
            Track progress across workspaces, projects, and boards. Pick up tasks,
            reply to comments, and keep your team aligned.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Today
          </p>
          <p className="mt-1 text-sm font-semibold">{formatToday()}</p>
        </div>
      </div>
    </section>
  );
}
