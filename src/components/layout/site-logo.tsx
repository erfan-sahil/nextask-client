import Image from "next/image";
import Link from "next/link";
import logoImage from "@/assets/logo/logo.png";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "header";
};

const sizeClasses = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-11 w-auto sm:h-12",
} as const;

export function SiteLogo({
  className,
  priority = false,
  size = "lg",
}: SiteLogoProps) {
  const isHeader = size === "header";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center transition-opacity hover:opacity-80",
        isHeader &&
          "relative h-14 w-32 shrink-0 overflow-visible sm:h-10 sm:w-20 lg:w-36",
        className,
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <Image
        src={logoImage}
        alt={siteConfig.name}
        priority={priority}
        className={cn(
          isHeader
            ? "absolute top-1/2 left-0 h-28 w-auto max-w-none origin-left -translate-y-1/2 scale-[0.85] sm:scale-[0.52] lg:scale-100"
            : sizeClasses[size],
        )}
      />
    </Link>
  );
}
