import Image from "next/image";
import Link from "next/link";
import logoImage from "@/assets/logo/logo.png";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
};

export function SiteLogo({ className, priority = false }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-80",
        className,
      )}
      aria-label="NexTask home"
    >
      <Image
        src={logoImage}
        alt="NexTask"
        priority={priority}
        className="h-12 w-auto sm:h-28"
      />
    </Link>
  );
}
