"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import {
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Palette,
  Settings2,
  ShieldAlert,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { authRoutes } from "@/config/navigation";
import { AppModalHeader } from "@/components/app/app-modal-header";
import { useAuth } from "@/hooks/use-auth";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/auth";

type SettingsTab = "profile" | "security" | "appearance";

const navItems: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Name and username",
    icon: User,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and account",
    icon: Lock,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme preferences",
    icon: Palette,
  },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

function StatusBanner({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl px-3.5 py-2.5 text-sm",
        tone === "success"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {message}
    </div>
  );
}

function SettingsPanel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer ? (
        <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const activeNav = navItems.find((item) => item.id === activeTab) ?? navItems[0];

  return (
    <div className="max-w-6xl px-4 py-6 sm:px-8">
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="h-1 bg-primary" />
        <div className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Settings2 className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile, security, and how NexTask looks for you.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <aside className="shrink-0 lg:sticky lg:top-6 lg:w-56">
          <nav
            aria-label="Settings sections"
            className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 lg:flex-col lg:overflow-visible"
          >
            {navItems.map(({ id, label, description, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-w-38 cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors lg:min-w-0",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-emerald-500/5 hover:text-foreground",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span
                      className={cn(
                        "mt-0.5 hidden text-xs lg:block",
                        isActive ? "text-primary/80" : "text-muted-foreground",
                      )}
                    >
                      {description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {activeNav.label}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {activeNav.description}
            </p>
          </div>

          {activeTab === "profile" && (
            <ProfileSection key={user?._id ?? "loading"} user={user} />
          )}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "appearance" && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}
        </main>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: UserType | undefined }) {
  const { updateProfileMutation } = useAuth({ fetchUser: false });
  const [form, setForm] = useState(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateProfileMutation.mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim().toLowerCase(),
      },
      {
        onSuccess: () => {
          setSuccessMessage("Profile updated successfully.");
          setErrorMessage("");
          setIsEditing(false);
        },
        onError: (error) => {
          setErrorMessage(
            getErrorMessage(error, "Unable to update your profile."),
          );
          setSuccessMessage("");
        },
      },
    );
  };

  const startEditing = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
    });
    setErrorMessage("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Account overview"
        description="Your public identity across workspaces and mentions."
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar
            name={fullName || "User"}
            avatar={user?.avatar}
            size="lg"
            className="size-16 text-lg ring-2 ring-background"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="truncate text-base font-semibold text-foreground">
                {fullName || "—"}
              </p>
              {user?.username ? (
                <p className="truncate text-sm text-muted-foreground">
                  @{user.username}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.email ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground">
                  <Mail className="size-3" />
                  <span className="truncate">{user.email}</span>
                </span>
              ) : null}
              {memberSince ? (
                <span className="inline-flex items-center rounded-lg bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground">
                  Joined {memberSince}
                </span>
              ) : null}
              {user?.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Verified
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </SettingsPanel>

      <form onSubmit={handleSubmit}>
        <SettingsPanel
          title="Personal information"
          description="Update the name and username shown across NexTask."
          footer={
            isEditing ? (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Changes apply immediately after saving.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Keep your profile details up to date for teammates.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={startEditing}
                  disabled={!user}
                  className="shrink-0"
                >
                  Edit profile
                </Button>
              </div>
            )
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                placeholder="First name"
                required
                maxLength={50}
                disabled={!isEditing}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Last name"
                required
                maxLength={50}
                disabled={!isEditing}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative max-w-md">
                <AtSign className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="username"
                  className="pl-7"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_]+"
                  disabled={!isEditing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                3–30 lowercase letters, numbers, or underscores. Used for
                mentions.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative max-w-md">
                <Mail className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email ?? ""}
                  className="pl-7"
                  disabled
                  readOnly
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email is used for sign-in and cannot be changed here.
              </p>
            </div>
          </div>

          {(successMessage || errorMessage) && (
            <div className="mt-4">
              <StatusBanner
                message={successMessage || errorMessage}
                tone={successMessage ? "success" : "error"}
              />
            </div>
          )}
        </SettingsPanel>
      </form>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pr-9"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
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
  const { changePasswordMutation, clearUser, deleteAccountMutation } = useAuth({
    fetchUser: false,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const updatePassword = (key: keyof typeof passwords, value: string) => {
    setPasswords((current) => ({ ...current, [key]: value }));
  };

  const toggle = (key: keyof typeof show) =>
    setShow((current) => ({ ...current, [key]: !current[key] }));

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    changePasswordMutation.mutate(passwords, {
      onSuccess: () => {
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordMessage(
          "Password updated. Please sign in again with your new password.",
        );
        setPasswordError("");
        clearUser();
        window.location.assign(authRoutes.login);
      },
      onError: (error) => {
        setPasswordError(
          getErrorMessage(error, "Unable to update your password."),
        );
        setPasswordMessage("");
      },
    });
  };

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deleteAccountMutation.mutate(
      { currentPassword: deletePassword },
      {
        onSuccess: () => {
          clearUser();
          window.location.assign(authRoutes.login);
        },
        onError: (error) => {
          setDeleteError(
            getErrorMessage(error, "Unable to delete your account."),
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handlePasswordSubmit}>
        <SettingsPanel
          title="Change password"
          description="Use at least 8 characters with one uppercase letter and one number."
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                You will need to sign in again after changing your password.
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={changePasswordMutation.isPending}
                className="shrink-0"
              >
                {changePasswordMutation.isPending
                  ? "Updating…"
                  : "Update password"}
              </Button>
            </div>
          }
        >
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Keep your account secure
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prefer a unique password you do not reuse on other sites.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              id="currentPassword"
              label="Current password"
              value={passwords.currentPassword}
              onChange={(value) => updatePassword("currentPassword", value)}
              show={show.current}
              onToggle={() => toggle("current")}
              placeholder="Enter current password"
            />
            <div className="hidden sm:block" />
            <PasswordField
              id="newPassword"
              label="New password"
              value={passwords.newPassword}
              onChange={(value) => updatePassword("newPassword", value)}
              show={show.next}
              onToggle={() => toggle("next")}
              placeholder="Create new password"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(value) => updatePassword("confirmPassword", value)}
              show={show.confirm}
              onToggle={() => toggle("confirm")}
              placeholder="Repeat new password"
            />
          </div>

          {(passwordMessage || passwordError) && (
            <div className="mt-4">
              <StatusBanner
                message={passwordMessage || passwordError}
                tone={passwordMessage ? "success" : "error"}
              />
            </div>
          )}
        </SettingsPanel>
      </form>

      <section className="overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/3">
        <div className="border-b border-destructive/15 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <ShieldAlert className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-destructive">
                Danger zone
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Irreversible actions that permanently affect your account.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently remove your account and associated data. This cannot
              be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setDeletePassword("");
              setDeleteError("");
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="size-3.5" />
            Delete account
          </Button>
        </div>
      </section>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <AppModalHeader
            title="Delete your account?"
            description="Enter your current password to permanently delete your account. This cannot be undone."
            icon={ShieldAlert}
            tone="destructive"
            onClose={() => setIsDeleteDialogOpen(false)}
            closeLabel="Close delete account dialog"
            disabled={deleteAccountMutation.isPending}
          />
          <form onSubmit={handleDeleteSubmit} className="space-y-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deletePassword">Current password</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="Enter current password"
                required
                autoFocus
              />
            </div>

            {deleteError && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {deleteError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteAccountMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending
                  ? "Deleting…"
                  : "Delete account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const themeOptions: {
  value: Theme;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function ThemePreview({ value }: { value: Theme }) {
  const isDark = value === "dark";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-2",
        isDark
          ? "border-zinc-700 bg-zinc-950"
          : "border-slate-200 bg-slate-50",
      )}
    >
      <div className="mb-1.5 flex items-center gap-1">
        <span
          className={cn(
            "size-1.5 rounded-full",
            isDark ? "bg-zinc-600" : "bg-slate-300",
          )}
        />
        <span
          className={cn(
            "size-1.5 rounded-full",
            isDark ? "bg-zinc-600" : "bg-slate-300",
          )}
        />
        <span
          className={cn(
            "size-1.5 rounded-full",
            isDark ? "bg-zinc-600" : "bg-slate-300",
          )}
        />
      </div>
      <div className="flex gap-1.5">
        <div
          className={cn(
            "h-10 w-4 rounded-sm",
            isDark ? "bg-zinc-800" : "bg-white shadow-sm",
          )}
        />
        <div className="flex-1 space-y-1">
          <div
            className={cn(
              "h-2 rounded-sm",
              isDark ? "bg-zinc-700" : "bg-slate-200",
            )}
          />
          <div
            className={cn(
              "h-2 w-4/5 rounded-sm",
              isDark ? "bg-zinc-800" : "bg-slate-100",
            )}
          />
          <div
            className={cn(
              "h-4 rounded-sm",
              isDark ? "bg-emerald-500/30" : "bg-emerald-500/20",
            )}
          />
        </div>
      </div>
    </div>
  );
}

function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <SettingsPanel
      title="Color scheme"
      description="Choose how NexTask looks across the app. Your preference is saved on this device."
    >
      <div
        role="radiogroup"
        aria-label="Color scheme"
        className="flex flex-wrap gap-3"
      >
        {themeOptions.map(({ value, label, icon: Icon }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(value)}
              className={cn(
                "w-36 cursor-pointer rounded-xl border p-2.5 text-left transition-colors",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-emerald-500/5",
              )}
            >
              <ThemePreview value={value} />
              <span className="mt-2 flex items-center justify-between gap-2 px-0.5">
                <span className="flex items-center gap-1.5">
                  <Icon
                    className={cn(
                      "size-3.5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </span>
                {isActive ? (
                  <CheckCircle2 className="size-3.5 text-primary" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </SettingsPanel>
  );
}
