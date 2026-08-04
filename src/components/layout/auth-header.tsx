import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthHeader() {
  return (
    <header className="relative border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between overflow-visible px-4 sm:px-6">
        <SiteLogo size="md" />
        <ThemeToggle />
      </div>
    </header>
  );
}
