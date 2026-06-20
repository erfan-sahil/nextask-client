import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <SiteLogo />
        <ThemeToggle />
      </div>
    </header>
  );
}
