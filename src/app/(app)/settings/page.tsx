import { Bell, Lock, Palette, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — NexTask" };

const sections = [
  {
    id: "profile",
    icon: User,
    tone: "bg-primary/10 text-primary",
    title: "Profile",
    description: "Update your name, username, avatar, and email address.",
  },
  {
    id: "security",
    icon: Lock,
    tone: "bg-chart-4/15 text-chart-4",
    title: "Security",
    description: "Change your password and manage active sessions.",
  },
  {
    id: "notifications",
    icon: Bell,
    tone: "bg-chart-2/15 text-chart-2",
    title: "Notifications",
    description: "Choose what you get notified about and how.",
  },
  {
    id: "appearance",
    icon: Palette,
    tone: "bg-chart-3/15 text-chart-3",
    title: "Appearance",
    description: "Switch between light and dark mode.",
  },
];

export default function SettingsPage() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${section.tone}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{section.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
