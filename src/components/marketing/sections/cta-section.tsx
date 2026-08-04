import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { authRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-primary-light dark:bg-card">
          <div className="h-1 w-full bg-primary" />

          <div className="px-6 py-14 text-center sm:px-10 sm:py-16">
            <div className="mx-auto max-w-xl">
              <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-card text-primary dark:bg-primary-light">
                <Layers className="size-5" aria-hidden />
              </span>

              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Ready when your team is
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
                Create an account in a minute and start organizing work with
                less friction.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={authRoutes.register}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 px-8 text-base transition-colors hover:bg-primary-hover",
                  )}
                >
                  Get started free
                  <ArrowRight data-icon="inline-end" />
                </Link>
                <Link
                  href={authRoutes.login}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 border-border bg-card px-8 text-base transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground dark:hover:border-primary/40 dark:hover:bg-primary/15 dark:hover:text-primary",
                  )}
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
