"use client";

import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex rounded-full border border-border bg-card p-1 ${className}`}
      role="group"
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          theme === "light"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          theme === "dark"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        Dark
      </button>
    </div>
  );
}
