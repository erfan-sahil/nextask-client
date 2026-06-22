"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
  type,
  ...inputProps
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          className={cn(
            authInputClassName,
            isPassword && "pr-12",
            error &&
              "border-destructive/50 focus-visible:border-destructive focus-visible:ring-destructive/20",
            className,
          )}
          {...inputProps}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
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
