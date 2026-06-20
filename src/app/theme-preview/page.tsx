import Link from "next/link";
import { ThemePreviewPanel } from "@/components/theme/theme-preview-panel";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function ThemePreviewPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="text-xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            NexTask
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden text-sm text-muted sm:block">
              App theme (full page)
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Theme comparison</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Light and dark palettes side by side. Use the toggle above to switch
            the full app theme, or compare both variants below at once.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ThemePreviewPanel mode="light" />
          <ThemePreviewPanel mode="dark" />
        </div>
      </main>
    </div>
  );
}
