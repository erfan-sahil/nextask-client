"use client";

import { useState } from "react";
import {
  AtSign,
  Bell,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Monitor,
  Moon,
  Palette,
  Sun,
  User,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/auth";

type SettingsTab = "profile" | "security" | "notifications" | "appearance";

const navItems: {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Sidebar navigation */}
        <aside className="shrink-0 lg:w-48">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content panel */}
        <main className="min-w-0 flex-1">
          {activeTab === "profile" && <ProfileSection user={user} />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "appearance" && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile Section
// ─────────────────────────────────────────────────────────────

function ProfileSection({ user }: { user: UserType | undefined }) {
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Avatar card */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-4 px-6 py-5">
          <div className="relative">
            <UserAvatar
              name={fullName || "User"}
              avatar={user?.avatar}
              size="lg"
              className="size-14 text-base ring-2 ring-background"
            />
            <button
              type="button"
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Camera className="size-3" aria-hidden />
            </button>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {fullName || "—"}
            </p>
            {user?.username && (
              <p className="truncate text-xs text-muted-foreground">
                @{user.username}
              </p>
            )}
            {memberSince && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground">
            Personal information
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Update your name, username, and email address.
          </p>
        </div>

        <Separator />

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              defaultValue={user?.firstName}
              placeholder="First name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              defaultValue={user?.lastName}
              placeholder="Last name"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                defaultValue={user?.username}
                placeholder="username"
                className="pl-7"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                placeholder="your@email.com"
                className={cn(user?.isEmailVerified && "pr-8")}
              />
              {user?.isEmailVerified && (
                <CheckCircle2 className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-chart-3" />
              )}
            </div>
            {user?.isEmailVerified ? (
              <p className="flex items-center gap-1 text-xs text-chart-3">
                <CheckCircle2 className="size-3" />
                Verified
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Email not verified.{" "}
                <button type="button" className="text-primary hover:underline">
                  Resend verification
                </button>
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end px-6 py-4">
          <Button size="sm">Save changes</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Security Section
// ─────────────────────────────────────────────────────────────

function PasswordField({
  id,
  label,
  show,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-9"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? (
            <EyeOff className="size-3.5" aria-hidden />
          ) : (
            <Eye className="size-3.5" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const toggle = (key: keyof typeof show) =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-4">
      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground">
            Change password
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Use a strong password with at least 8 characters.
          </p>
        </div>

        <Separator />

        <div className="space-y-4 px-6 py-5">
          <PasswordField
            id="currentPassword"
            label="Current password"
            show={show.current}
            onToggle={() => toggle("current")}
            placeholder="Enter current password"
          />
          <PasswordField
            id="newPassword"
            label="New password"
            show={show.next}
            onToggle={() => toggle("next")}
            placeholder="Enter new password"
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            show={show.confirm}
            onToggle={() => toggle("confirm")}
            placeholder="Re-enter new password"
          />
        </div>

        <Separator />

        <div className="flex justify-end px-6 py-4">
          <Button size="sm">Update password</Button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-destructive">
              Delete account
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" size="sm" className="shrink-0">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Notifications Section
// ─────────────────────────────────────────────────────────────

type NotifPrefs = {
  emailNotifications: boolean;
  taskReminders: boolean;
  sprintUpdates: boolean;
  commentMentions: boolean;
  weeklyDigest: boolean;
};

const notifItems: {
  key: keyof NotifPrefs;
  label: string;
  description: string;
}[] = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Receive important updates directly to your inbox.",
  },
  {
    key: "taskReminders",
    label: "Task reminders",
    description: "Get reminded about tasks approaching their due date.",
  },
  {
    key: "sprintUpdates",
    label: "Sprint updates",
    description: "Stay informed when sprint status or assignments change.",
  },
  {
    key: "commentMentions",
    label: "Comment mentions",
    description: "Notify me when someone mentions @me in a comment.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "Receive a weekly summary of your activity and progress.",
  },
];

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-primary" : "bg-input",
      )}
    >
      <span
        className={cn(
          "size-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotifPrefs>({
    emailNotifications: true,
    taskReminders: true,
    sprintUpdates: false,
    commentMentions: true,
    weeklyDigest: false,
  });

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground">
          Notification preferences
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Choose what you get notified about and how.
        </p>
      </div>

      <Separator />

      <ul className="divide-y divide-border">
        {notifItems.map(({ key, label, description }) => (
          <li
            key={key}
            className="flex items-center justify-between gap-6 px-6 py-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <Toggle
              checked={prefs[key]}
              onToggle={() => toggle(key)}
              label={`Toggle ${label}`}
            />
          </li>
        ))}
      </ul>

      <Separator />

      <div className="flex justify-end px-6 py-4">
        <Button size="sm">Save preferences</Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Appearance Section
// ─────────────────────────────────────────────────────────────

const themeOptions: {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: React.ReactNode;
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    preview: (
      <div className="h-20 rounded-t-lg bg-white p-3">
        <div className="mb-2 h-2 w-12 rounded-full bg-gray-200" />
        <div className="mb-3 h-1.5 w-16 rounded-full bg-gray-100" />
        <div className="flex gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-gray-100" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-gray-100" />
            <div className="h-1.5 w-3/4 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    preview: (
      <div className="h-20 rounded-t-lg bg-zinc-900 p-3">
        <div className="mb-2 h-2 w-12 rounded-full bg-zinc-600" />
        <div className="mb-3 h-1.5 w-16 rounded-full bg-zinc-800" />
        <div className="flex gap-1.5">
          <div className="h-8 w-8 rounded-lg bg-zinc-800" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-zinc-800" />
            <div className="h-1.5 w-3/4 rounded-full bg-zinc-700" />
          </div>
        </div>
      </div>
    ),
  },
];

function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground">
            Color scheme
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose how NexTask looks for you.
          </p>
        </div>

        <Separator />

        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
            {themeOptions.map(({ value, label, icon: Icon, preview }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "overflow-hidden rounded-xl border-2 text-left transition-all",
                  theme === value
                    ? "border-primary shadow-sm shadow-primary/10"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                {preview}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5",
                    theme === value ? "bg-primary/5" : "bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {label}
                    </span>
                  </div>
                  {theme === value && (
                    <CheckCircle2 className="size-3.5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interface density */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground">
            Interface density
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Control how compact the UI feels.
          </p>
        </div>

        <Separator />

        <div className="space-y-2 px-6 py-5">
          {(
            [
              {
                id: "comfortable",
                label: "Comfortable",
                desc: "More breathing room between elements.",
              },
              {
                id: "compact",
                label: "Compact",
                desc: "Fit more content on screen at once.",
              },
            ] as const
          ).map(({ id, label, desc }) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/40 has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="radio"
                name="density"
                value={id}
                defaultChecked={id === "comfortable"}
                className="accent-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground">Language</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose your preferred language for the interface.
          </p>
        </div>

        <Separator />

        <div className="px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="language">
              <Monitor className="size-3.5" />
              Display language
            </Label>
            <Select defaultValue="en">
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
