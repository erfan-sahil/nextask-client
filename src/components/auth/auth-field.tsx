import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const authInputClassName =
  "h-11 rounded-full border-border bg-background px-5 shadow-sm transition-all placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 dark:bg-background/80";

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & React.ComponentProps<"input">;

export function AuthField({
  id,
  label,
  hint,
  error,
  className,
  ...inputProps
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          authInputClassName,
          error &&
            "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20",
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p className="px-1 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="px-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type AuthAlertProps = {
  children: React.ReactNode;
  variant?: "error" | "success";
};

export function AuthAlert({ children, variant = "error" }: AuthAlertProps) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "error" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        variant === "success" &&
          "border-primary/20 bg-primary-light text-primary",
      )}
      role="alert"
    >
      {children}
    </p>
  );
}
