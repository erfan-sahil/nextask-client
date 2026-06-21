"use client";

import { useEffect, useState } from "react";
import { AuthActions } from "@/components/layout/auth-actions";
import {
  MobileMenuButton,
  MobileNavOverlay,
  MobileNavPanel,
} from "@/components/layout/mobile-nav";
import { SiteLogo } from "@/components/layout/site-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 overflow-visible px-4 pt-2 sm:px-6">
      <MobileNavOverlay open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="relative z-50 mx-auto max-w-6xl">
        <div
          className={cn(
            "relative border transition-[border-color,background-color,box-shadow] duration-300",
            mobileOpen
              ? "rounded-2xl border-border bg-background shadow-xl shadow-black/10"
              : cn(
                  "rounded-2xl",
                  scrolled
                    ? "border-border/70 bg-background/85 shadow-lg shadow-black/5 backdrop-blur-xl"
                    : "border-border/60 bg-card/95 shadow-sm backdrop-blur-md dark:border-border/40 dark:bg-background/60",
                ),
          )}
        >
          <div className="flex h-16 items-center justify-between gap-4 overflow-visible px-4 sm:h-auto sm:min-h-14 sm:px-5 sm:py-2">
            <SiteLogo priority size="md" />

            <div className="hidden items-center gap-3 md:flex">
              <ThemeToggle />
              <AuthActions />
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <MobileMenuButton
                open={mobileOpen}
                onClick={() => setMobileOpen((current) => !current)}
              />
            </div>
          </div>

          <MobileNavPanel open={mobileOpen} onOpenChange={setMobileOpen} />
        </div>
      </div>
    </header>
  );
}
