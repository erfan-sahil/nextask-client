import Image from "next/image";
import Link from "next/link";
import logoDarkImage from "@/assets/logo/logo-dark.png";
import logoImage from "@/assets/logo/logo.png";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "header";
};

const sizeClasses = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-11 w-auto sm:h-12",
  xl: "h-28 w-auto sm:h-32",
} as const;

const headerImageClassName =
  "absolute top-1/2 left-0 h-28 w-auto max-w-none origin-left -translate-y-1/2 scale-[0.85] sm:scale-[0.52] lg:scale-100";

export function SiteLogo({
  className,
  priority = false,
  size = "lg",
}: SiteLogoProps) {
  const isHeader = size === "header";
  const imageClassName = isHeader ? headerImageClassName : sizeClasses[size];

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
        className={cn(imageClassName, "dark:hidden")}
      />
      <Image
        src={logoDarkImage}
        alt={siteConfig.name}
        priority={priority}
        className={cn(imageClassName, "hidden dark:block")}
      />
    </Link>
  );
}
