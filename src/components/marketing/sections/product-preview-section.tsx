import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "Backlog",
    highlight: false,
    items: [
      { title: "User research summary", tag: "Research", active: false },
      { title: "API integration plan", tag: "Eng", active: false },
    ],
  },
  {
    title: "In progress",
    highlight: true,
    items: [
      { title: "Sprint planning", tag: "PM", active: true },
      { title: "Onboarding flow", tag: "Product", active: false },
    ],
  },
  {
    title: "Done",
    highlight: false,
    items: [
      { title: "Auth flow review", tag: "Eng", active: false },
      { title: "Kickoff complete", tag: "Ops", active: false },
    ],
  },
];

const chatMessages = [
  {
    name: "Maya",
    initials: "M",
    text: "Looks ready for review. Want a second pass?",
    own: false,
  },
  {
    name: "You",
    initials: "Y",
    text: "@maya yes, moving it over now.",
    own: true,
  },
  {
    name: "Leo",
    initials: "L",
    text: "I can take the API plan next.",
    own: false,
  },
];

export function ProductPreviewSection() {
  return (
    <section id="product" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.16em] text-primary uppercase">
            Inside the product
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            A quick look at the daily flow
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Move work across columns, then loop in the team without switching
            tools.
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-1 w-full bg-primary" />

            <div className="grid lg:grid-cols-2 lg:items-stretch">
              {/* Board panel */}
              <div className="flex min-h-0 flex-col border-b border-border lg:border-r lg:border-b-0">
                <div className="flex h-[4.5rem] items-center justify-between gap-3 border-b border-border bg-card px-5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                      Engineering
                    </p>
                    <p className="truncate text-lg font-bold tracking-tight">
                      Platform Q2 Roadmap
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary dark:bg-primary/15">
                    Live board
                  </span>
                </div>

                <div className="grid flex-1 grid-cols-1 content-start gap-3 bg-muted p-4 sm:grid-cols-3 sm:p-5 dark:bg-background">
                  {columns.map((column) => (
                    <div
                      key={column.title}
                      className={cn(
                        "rounded-xl border bg-card p-3",
                        column.highlight
                          ? "border-primary/30"
                          : "border-border",
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              column.highlight
                                ? "bg-primary"
                                : "bg-muted-foreground/40",
                            )}
                          />
                          <h3 className="text-sm font-semibold">
                            {column.title}
                          </h3>
                        </div>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-xs font-bold",
                            column.highlight
                              ? "bg-primary-light text-primary dark:bg-primary/15"
                              : "bg-muted text-muted-foreground dark:bg-muted",
                          )}
                        >
                          {column.items.length}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {column.items.map((item) => (
                          <li
                            key={item.title}
                            className={cn(
                              "rounded-lg border px-3 py-2.5",
                              item.active
                                ? "border-primary/20 bg-primary-light dark:bg-primary/10"
                                : "border-border bg-background",
                            )}
                          >
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {item.tag}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat panel */}
              <div className="flex min-h-0 flex-col bg-card">
                <div className="flex h-[4.5rem] items-center gap-3 border-b border-border bg-card px-5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageCircle className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">Team thread</p>
                    <p className="truncate text-xs text-muted-foreground">
                      3 online
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 bg-background p-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.text}
                      className={cn(
                        "flex gap-2.5",
                        message.own && "flex-row-reverse",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          message.own
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary-light text-primary dark:bg-primary/15",
                        )}
                      >
                        {message.initials}
                      </div>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                          message.own
                            ? "rounded-tr-md bg-primary text-primary-foreground"
                            : "rounded-tl-md border border-border bg-card",
                        )}
                      >
                        <p
                          className={cn(
                            "text-[11px] font-semibold",
                            message.own
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground",
                          )}
                        >
                          {message.name}
                        </p>
                        <p className="mt-0.5 text-sm leading-5">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-auto" />
                </div>

                <div className="border-t border-border bg-card px-4 py-3">
                  <div className="rounded-xl border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground dark:bg-background">
                    Write a message…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
