import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { authRoutes } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "To do",
    count: 2,
    accent: false,
    tasks: [
      { title: "Map user journeys", tag: "Design", tone: "muted" as const },
      { title: "Invite members", tag: "Ops", tone: "muted" as const },
    ],
  },
  {
    title: "Doing",
    count: 2,
    accent: true,
    tasks: [
      { title: "Build sprint board", tag: "Eng", tone: "active" as const },
      { title: "Review timeline", tag: "PM", tone: "muted" as const },
    ],
  },
  {
    title: "Done",
    count: 1,
    accent: false,
    tasks: [{ title: "Kickoff notes", tag: "Setup", tone: "done" as const }],
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:pt-20 lg:pb-24">
        <div>
          <p className="animate-in fade-in slide-in-from-bottom-2 text-5xl font-extrabold tracking-tight text-primary duration-500 sm:text-6xl lg:text-7xl">
            {siteConfig.name}
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-3 mt-5 max-w-xl text-3xl font-bold tracking-tight text-balance text-foreground duration-700 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Project management that stays clear as your team grows
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-4 mt-5 max-w-md text-base leading-7 text-muted-foreground duration-700 sm:text-lg">
            One calm place to plan work, track progress, and keep everyone
            aligned, without the noise of bloated tools.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-5 mt-8 flex flex-col gap-3 duration-700 sm:flex-row sm:items-center">
            <Link
              href={authRoutes.register}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 px-8 text-base transition-colors hover:bg-primary-hover",
              )}
            >
              Start free
              <ArrowRight data-icon="inline-end" />
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 border-border bg-card px-8 text-base transition-colors hover:border-primary/30 hover:bg-primary-light hover:text-primary dark:hover:border-primary/25 dark:hover:bg-primary/10 dark:hover:text-primary",
              )}
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-right-4 relative duration-1000">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-1 w-full bg-primary" />

            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  Project board
                </p>
                <div className="mt-0.5 flex min-w-0 items-center gap-2">
                  <p className="truncate text-base font-bold tracking-tight text-foreground">
                    Website Redesign
                  </p>
                  <span className="hidden shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:inline">
                    5 total tasks
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center -space-x-1.5 sm:flex">
                  {["M", "Y", "L"].map((initial) => (
                    <span
                      key={initial}
                      className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary-light text-[10px] font-bold text-primary dark:bg-primary/15"
                    >
                      {initial}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
                  <MessageCircle className="size-3.5" aria-hidden />2
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary-light px-4 py-2.5 dark:bg-muted sm:px-5">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CheckSquare className="size-3" aria-hidden />
                </span>
                5 tasks
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium capitalize text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <TrendingUp className="size-3" aria-hidden />
                </span>
                Active
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground">
                <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="size-3" aria-hidden />
                </span>
                3 members
              </span>
            </div>

            <div className="grid gap-2.5 bg-primary-light p-3 dark:bg-muted sm:grid-cols-3 sm:gap-3 sm:p-4">
              {columns.map((column) => (
                <div
                  key={column.title}
                  className={cn(
                    "rounded-xl border bg-card p-2.5",
                    column.accent ? "border-primary/30" : "border-border",
                  )}
                >
                  <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          column.accent
                            ? "bg-primary"
                            : "bg-muted-foreground/40",
                        )}
                      />
                      <h2 className="text-xs font-semibold text-foreground">
                        {column.title}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                        column.accent
                          ? "bg-primary-light text-primary dark:bg-primary/15"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {column.count}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {column.tasks.map((task) => (
                      <li
                        key={task.title}
                        className={cn(
                          "rounded-lg border px-2.5 py-2",
                          task.tone === "active"
                            ? "border-primary/20 bg-primary/10 text-foreground"
                            : "border-border bg-card",
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs font-semibold leading-snug",
                            task.tone === "done" &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                          {task.tag}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 border-t border-border px-4 py-3 sm:px-5">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/40" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <p className="min-w-0 truncate text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Maya</span>{" "}
                moved{" "}
                <span className="font-medium text-foreground">
                  Build sprint board
                </span>{" "}
                to Doing
              </p>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                Just now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
