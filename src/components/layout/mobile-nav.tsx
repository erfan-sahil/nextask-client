"use client";

import { useEffect } from "react";
import { AuthActions } from "@/components/layout/auth-actions";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const panelEase = "cubic-bezier(0.32, 0.72, 0, 1)";

export function MobileNavOverlay({
  open,
  onOpenChange,
}: Pick<MobileNavProps, "open" | "onOpenChange">) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", onKeyDown);
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
      style={{ transitionTimingFunction: panelEase }}
      onClick={() => onOpenChange(false)}
    />
  );
}

export function MobileNavPanel({
  open,
  onOpenChange,
}: Pick<MobileNavProps, "open" | "onOpenChange">) {
  return (
    <div
      role="region"
      aria-hidden={!open}
      aria-label="Mobile menu"
      className={cn(
        "grid transition-[grid-template-rows] duration-300 md:hidden",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
      style={{ transitionTimingFunction: panelEase }}
    >
      <div className="min-h-0 overflow-hidden rounded-b-2xl">
        <div
          className={cn(
            "px-4 pb-5 pt-1 transition-[opacity,transform] duration-300 sm:px-5",
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0",
          )}
          style={{
            transitionTimingFunction: panelEase,
            transitionDelay: open ? "60ms" : "0ms",
          }}
        >
          <div
            aria-hidden
            className="mb-4 h-px bg-linear-to-r from-transparent via-border/80 to-transparent"
          />
          <AuthActions
            layout="stacked"
            animate
            open={open}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use MobileNavOverlay + MobileNavPanel inside the header shell instead */
export function MobileNav(props: MobileNavProps) {
  return (
    <>
      <MobileNavOverlay {...props} />
      <MobileNavPanel {...props} />
    </>
  );
}

type MobileMenuButtonProps = {
  open: boolean;
  onClick: () => void;
};

export function MobileMenuButton({ open, onClick }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="relative flex size-9 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-emerald-500/5 md:hidden"
    >
      <span className="relative block size-4">
        <span
          aria-hidden
          className={cn(
            "absolute left-0 block h-0.5 w-4 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "top-[7px] rotate-45" : "top-0.5",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute left-0 top-[7px] block h-0.5 w-4 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute left-0 block h-0.5 w-4 rounded-full bg-foreground transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            open ? "top-[7px] -rotate-45" : "top-[13px]",
          )}
        />
      </span>
    </button>
  );
}
