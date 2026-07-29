import {
  Building2,
  CheckSquare,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Building2,
    title: "Company workspaces",
    description:
      "Give each department or client a dedicated workspace with its own members, settings, and context.",
  },
  {
    icon: FolderKanban,
    title: "Projects inside workspaces",
    description:
      "Run multiple initiatives in parallel — from product launches to internal ops — without mixing priorities.",
  },
  {
    icon: Columns3,
    title: "Kanban boards",
    description:
      "Organize each project with visual boards and columns — backlog, in progress, and done — so work flows naturally.",
  },
  {
    icon: CheckSquare,
    title: "Structured task management",
    description:
      "Break work into clear tasks with ownership, status, and progress so nothing slips through the cracks.",
  },
  {
    icon: LayoutDashboard,
    title: "Focused dashboards",
    description:
      "See what matters now with calm, scannable views designed to reduce cognitive load.",
  },
  {
    icon: Users,
    title: "Team alignment",
    description:
      "Keep everyone on the same page with shared projects, visible progress, and accountable ownership.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-border bg-muted/40 py-14 sm:py-16 dark:bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">
            Features
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your company needs to plan and deliver
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            NexTask mirrors how teams actually work — company first, then
            workspace, project, board, and task — so structure feels natural.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-500/5 dark:border-border/80 dark:bg-card/80 dark:hover:bg-emerald-400/10 dark:hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-base font-semibold">
                  {feature.title}
                </CardTitle>
                <CardDescription className="leading-6">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
