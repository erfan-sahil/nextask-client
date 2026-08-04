import {
  CheckSquare,
  Columns3,
  FolderKanban,
  Layers,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  wide?: boolean;
}[] = [
  {
    icon: Layers,
    title: "Workspaces",
    description:
      "A dedicated home for each company, team, or client, with members and context kept together.",
    wide: true,
  },
  {
    icon: FolderKanban,
    title: "Projects",
    description:
      "Run multiple initiatives in parallel without mixing priorities or owners.",
  },
  {
    icon: Columns3,
    title: "Boards",
    description:
      "Kanban columns that match how your team plans, builds, and ships.",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    description:
      "Clear ownership, status, and progress so nothing slips through.",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    description:
      "Real-time conversation with mentions, so decisions stay next to the work.",
    wide: true,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            What you get with NexTask
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            The core pieces of the product. Nothing extra, nothing buried.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:bg-primary-light sm:p-7 dark:hover:border-primary/25 dark:hover:bg-primary/10",
                feature.wide && "sm:col-span-2",
              )}
            >
              <div className="absolute top-0 left-0 h-full w-1 bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground dark:bg-primary/15 dark:group-hover:bg-primary-light dark:group-hover:text-primary dark:group-hover:ring-2 dark:group-hover:ring-primary/35">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <span className="font-mono text-xs font-semibold text-primary/50">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
