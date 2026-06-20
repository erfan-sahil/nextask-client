import Link from "next/link";
import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function SiteLogo({ className, showWordmark = true }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 transition-opacity hover:opacity-80", className)}
      aria-label="NexTask home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Layers3 className="size-5" aria-hidden />
      </span>
      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Nex<span className="text-primary">Task</span>
        </span>
      ) : null}
    </Link>
  );
}
