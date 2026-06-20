import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold text-primary">NexTask</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/register"
              className="text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              Sign up
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="mb-4 rounded-full bg-primary-light px-4 py-1 text-sm font-medium text-primary">
            Task management made simple
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Organize your work with{" "}
            <span className="text-primary">NexTask</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            A clean and focused way to manage your tasks, stay productive, and
            get things done.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Start for free
            </Link>
            <a
              href="#"
              className="rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-card-foreground transition-colors hover:border-primary-muted hover:text-primary"
            >
              Learn more NexTask
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NexTask. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
