import { Brain, Clock3, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Brain,
    title: "Less mental clutter",
    description:
      "Separate workspaces keep unrelated work out of sight, so your team can think clearly.",
  },
  {
    icon: Target,
    title: "Clear priorities",
    description:
      "Projects, boards, and tasks stay connected to the right context — no more guessing what matters now.",
  },
  {
    icon: Clock3,
    title: "Steady momentum",
    description:
      "Simple workflows help teams move from planning to delivery without constant context switching.",
  },
];

export function ProductivitySection() {
  return (
    <section className="border-y border-border bg-primary-light/35 py-14 sm:py-16 dark:bg-primary-light/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="rounded-full border border-primary/15 bg-background/70 text-primary"
          >
            Built for focus
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Productivity that feels calm, not chaotic
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            NexTask is designed around cognitive ease — clean hierarchy, gentle
            visuals, and just enough structure to keep teams moving.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 sm:mt-12">
          {benefits.map((item) => (
            <Card
              key={item.title}
              className="border-border bg-card shadow-sm dark:border-primary/10 dark:bg-background/80"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
