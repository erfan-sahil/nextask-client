"use client";

import { X } from "lucide-react";
import type { ElementType } from "react";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AppModalHeaderProps = {
  title: string;
  description: string;
  icon: ElementType;
  onClose: () => void;
  closeLabel: string;
  disabled?: boolean;
  tone?: "default" | "destructive";
  className?: string;
};

export function AppModalHeader({
  title,
  description,
  icon: Icon,
  onClose,
  closeLabel,
  disabled = false,
  tone = "default",
  className,
}: AppModalHeaderProps) {
  const isDestructive = tone === "destructive";

  return (
    <DialogHeader
      className={cn(
        "relative gap-4 border-b p-6 pb-5 pr-16",
        isDestructive
          ? "border-red-500/15 bg-red-500/10 text-red-800 dark:text-red-200"
          : "border-emerald-500/15 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={disabled}
        aria-label={closeLabel}
        className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-current/70 transition-colors hover:bg-black/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
            isDestructive ? "bg-red-500" : "bg-emerald-500",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <DialogDescription className="font-medium text-current/70">
            {description}
          </DialogDescription>
          <DialogTitle className="mt-1 text-xl leading-tight">{title}</DialogTitle>
        </div>
      </div>
    </DialogHeader>
  );
}
