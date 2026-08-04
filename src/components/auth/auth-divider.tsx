import { cn } from "@/lib/utils";

type AuthDividerProps = {
  label?: string;
  className?: string;
};

export function AuthDivider({
  label = "or",
  className,
}: AuthDividerProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-3 text-xs text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
