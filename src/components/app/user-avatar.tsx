import Image from "next/image";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  fallback?: "initials" | "first-letter";
  className?: string;
};

const sizeClasses = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
} as const;

const sizePixels = {
  sm: 28,
  md: 36,
  lg: 44,
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getFirstLetter(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function UserAvatar({
  name,
  avatar,
  size = "md",
  fallback = "initials",
  className,
}: UserAvatarProps) {
  if (avatar) {
    const pixelSize = sizePixels[size];

    return (
      <Image
        src={avatar}
        alt={name}
        width={pixelSize}
        height={pixelSize}
        className={cn(
          "rounded-full object-cover ring-2 ring-background",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary ring-2 ring-background",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {fallback === "first-letter" ? getFirstLetter(name) : getInitials(name)}
    </div>
  );
}
