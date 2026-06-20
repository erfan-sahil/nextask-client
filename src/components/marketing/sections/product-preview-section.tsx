import { Badge } from "@/components/ui/badge";

const columns = [
  {
    title: "Backlog",
    count: 4,
    items: ["User research summary", "API integration plan", "Design tokens audit"],
    tone: "bg-muted",
  },
  {
    title: "In progress",
    count: 2,
    items: ["Sprint planning", "Workspace onboarding flow"],
    tone: "bg-primary-light text-primary",
  },
  {
    title: "Done",
    count: 3,
    items: ["Auth flow review", "Project templates", "Task status model"],
    tone: "bg-primary/10 text-primary",
  },
];

export function ProductPreviewSection() {
  return (
    <section id="product" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full">
            Product preview
          </Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Manage tasks the way your team already thinks
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Kanban boards with clear columns, statuses, and workspace-aware
            projects keep daily work organized without overwhelming your team.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 sm:mt-12">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Engineering Workspace
              </p>
              <p className="text-lg font-semibold">Platform Q2 Roadmap</p>
              <p className="text-sm text-muted-foreground">Sprint Board</p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              3 members
            </Badge>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-3">
            {columns.map((column) => (
              <div
                key={column.title}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{column.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${column.tone}`}
                  >
                    {column.count}
                  </span>
                </div>
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground shadow-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
