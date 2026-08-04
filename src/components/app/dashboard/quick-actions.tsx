import { Columns3, FolderKanban, Layers, Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "New task",
    description: "Add to the current sprint board",
    icon: SquarePen,
  },
  {
    label: "New project",
    description: "Start a project in this workspace",
    icon: FolderKanban,
  },
  {
    label: "New board",
    description: "Create a kanban or list view",
    icon: Columns3,
  },
  {
    label: "Invite member",
    description: "Grow your workspace team",
    icon: Layers,
  },
] as const;

export function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="mb-4">
        <h3 className="text-lg font-semibold tracking-tight">Quick actions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Jump into the work that matters most.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <ul className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <li key={action.label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:bg-emerald-500/5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{action.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                  <Plus className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ul>

        <Button className="mt-4 w-full rounded-full">Create task</Button>
      </div>
    </section>
  );
}
