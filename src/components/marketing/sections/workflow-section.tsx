import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Create a workspace",
    description:
      "Set up a space for your company, team, or client. Invite members and define how work is organized.",
  },
  {
    step: "02",
    title: "Add projects",
    description:
      "Launch initiatives inside the workspace — campaigns, releases, onboarding flows, or internal goals.",
  },
  {
    step: "03",
    title: "Set up boards",
    description:
      "Create kanban boards for each project with columns that match how your team plans, builds, and ships.",
  },
  {
    step: "04",
    title: "Manage tasks with clarity",
    description:
      "Assign, track, and complete tasks on boards with a workflow that keeps momentum high and mental load low.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
          <div>
            <Badge variant="outline" className="rounded-full">
              How it works
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              A simple hierarchy that matches real work
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              No bloated setup. NexTask gives you a clear path from company
              structure to daily execution — so teams always know where work
              belongs.
            </p>
          </div>

          <ol className="space-y-4">
            {steps.map((item, index) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute -bottom-4 left-8 h-4 w-px bg-border"
                  />
                ) : null}
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
