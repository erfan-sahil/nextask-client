import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { authRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,var(--primary-light),var(--background))] px-6 py-12 text-center sm:px-10 sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 size-44 rounded-full bg-primary-muted/15 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to bring clarity to your company&apos;s work?
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Create your first workspace, spin up projects, set up kanban
              boards, and give your team a focused place to manage tasks — all
              in NexTask.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={authRoutes.login}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 rounded-full px-7 hover:bg-primary-hover",
                )}
              >
                Get started free
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href={authRoutes.login}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-full bg-background/70 px-7 backdrop-blur-sm",
                )}
              >
                Log in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
