"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-border bg-card p-1",
        className,
      )}
      role="group"
      aria-label="Theme"
    >
      <Button
        type="button"
        size="xs"
        variant={theme === "light" ? "default" : "ghost"}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        className="rounded-full px-3"
      >
        Light
      </Button>
      <Button
        type="button"
        size="xs"
        variant={theme === "dark" ? "default" : "ghost"}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        className="rounded-full px-3"
      >
        Dark
      </Button>
    </div>
  );
}
