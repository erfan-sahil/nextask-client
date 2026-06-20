import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,125,91,0.12),transparent_42%),linear-gradient(to_bottom,transparent,rgba(15,125,91,0.04))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
        <div>
          <Badge
            variant="secondary"
            className="mb-6 rounded-full border border-primary/15 bg-primary-light px-3 py-1 text-primary"
          >
            <Sparkles data-icon="inline-start" />
            Project management, without the noise
          </Badge>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Organize every team with{" "}
            <span className="text-primary">workspaces</span>, projects, and
            tasks
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            NexTask helps companies create dedicated workspaces, run multiple
            projects inside each one, and manage tasks with clarity — so your
            team stays focused and productive.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full px-7 hover:bg-primary-hover",
              )}
            >
              Start your workspace
              <ArrowRight data-icon="inline-end" />
            </Link>
            <a
              href="#product"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 rounded-full px-7",
              )}
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[
              { label: "Workspaces", value: "Per team" },
              { label: "Projects", value: "Unlimited" },
              { label: "Tasks", value: "Structured" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="absolute -left-6 top-8 hidden h-24 w-24 rounded-full bg-primary/10 blur-2xl lg:block" />
          <div className="absolute -right-4 bottom-0 hidden h-28 w-28 rounded-full bg-primary-muted/20 blur-2xl lg:block" />

          <div className="rounded-2xl border border-border bg-card/90 p-5 shadow-xl shadow-primary/5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Acme Corp
                </p>
                <p className="text-lg font-semibold">Product Workspace</p>
              </div>
              <Badge className="rounded-full">Active</Badge>
            </div>

            <div className="space-y-3">
              {[
                {
                  project: "Website Redesign",
                  tasks: [
                    { title: "Finalize wireframes", done: true },
                    { title: "Review component library", done: false },
                    { title: "Ship landing page v2", done: false },
                  ],
                },
                {
                  project: "Mobile App Launch",
                  tasks: [
                    { title: "QA sprint checklist", done: true },
                    { title: "App store assets", done: false },
                  ],
                },
              ].map((item) => (
                <div
                  key={item.project}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.project}</p>
                    <span className="text-xs text-muted-foreground">
                      {item.tasks.filter((t) => t.done).length}/
                      {item.tasks.length} done
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {item.tasks.map((task) => (
                      <li
                        key={task.title}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            task.done ? "bg-primary" : "bg-border",
                          )}
                        />
                        <span
                          className={cn(task.done && "line-through opacity-70")}
                        >
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Button className="mt-4 w-full rounded-full hover:bg-primary-hover">
              Open workspace
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
