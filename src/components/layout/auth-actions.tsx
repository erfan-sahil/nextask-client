import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { authRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";

type AuthActionsProps = {
  layout?: "inline" | "stacked";
  className?: string;
  onNavigate?: () => void;
  animate?: boolean;
  open?: boolean;
};

const panelEase = "cubic-bezier(0.32, 0.72, 0, 1)";

export function AuthActions({
  layout = "inline",
  className,
  onNavigate,
  animate = false,
  open = false,
}: AuthActionsProps) {
  const stagger = (index: number) =>
    animate
      ? {
          transitionDelay: open ? `${80 + index * 60}ms` : "0ms",
          transitionTimingFunction: panelEase,
        }
      : undefined;

  const motion = (index: number) =>
    cn(
      animate && "transition-all duration-500",
      animate &&
        (open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"),
    );

  const loginClassName = cn(
    buttonVariants({ variant: "outline", size: "default" }),
    "h-9 rounded-full border-border/70 bg-background/60 px-4 shadow-sm backdrop-blur-sm hover:bg-muted/80",
  );

  const getStartedClassName = cn(
    buttonVariants({ size: "default" }),
    "group h-9 rounded-full px-5 shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25",
  );

  const stackedLoginClassName = cn(
    buttonVariants({ variant: "outline", size: "default" }),
    "h-11 w-full rounded-xl border-border/70 bg-muted/30 px-5 hover:bg-muted/60",
  );

  const stackedGetStartedClassName = cn(
    buttonVariants({ size: "default" }),
    "group h-11 w-full rounded-xl px-5 shadow-sm hover:bg-primary-hover",
  );

  if (layout === "stacked") {
    return (
      <div className={cn("flex flex-col gap-2.5", className)}>
        <Link
          href={authRoutes.login}
          onClick={onNavigate}
          style={stagger(0)}
          className={cn(stackedLoginClassName, motion(0))}
        >
          Log in
        </Link>
        <Link
          href={authRoutes.login}
          onClick={onNavigate}
          style={stagger(1)}
          className={cn(stackedGetStartedClassName, motion(1))}
        >
          Get started
          <ArrowRight
            data-icon="inline-end"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link
        href={authRoutes.login}
        onClick={onNavigate}
        className={loginClassName}
      >
        Log in
      </Link>
      <Link
        href={authRoutes.login}
        onClick={onNavigate}
        className={getStartedClassName}
      >
        Get started
        <ArrowRight
          data-icon="inline-end"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
