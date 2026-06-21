import { cn } from "@/lib/utils";

type AuthBadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function AuthBadge({ children, className }: AuthBadgeProps) {
  return (
    <span
      className={cn(
        "mb-5 inline-flex items-center rounded-full border border-primary/20",
        "bg-linear-to-r from-primary-light/95 via-primary-light/75 to-primary-light/55",
        "px-4 py-1.5 text-sm font-medium text-primary",
        "shadow-sm shadow-primary/10 ring-1 ring-inset ring-primary/10",
        "backdrop-blur-sm",
        "dark:border-primary/25 dark:from-primary-light/35 dark:via-primary-light/25 dark:to-primary-light/15",
        "dark:shadow-primary/5 dark:ring-primary/15",
        className,
      )}
    >
      {children}
    </span>
  );
}
