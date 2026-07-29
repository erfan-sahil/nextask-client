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
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { authRoutes } from "@/config/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types/auth";

type SettingsTab = "profile" | "security" | "appearance";

const navItems: {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

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
        <aside className="shrink-0 lg:w-48">
          <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-emerald-500/5 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
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
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-4 px-6 py-5">
          <UserAvatar
            name={fullName || "User"}
            avatar={user?.avatar}
            size="lg"
            className="size-14 text-base ring-2 ring-background"
          />
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Personal information
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update the name and username shown across NexTask.
            </p>
          </div>
          {!isEditing && (
            <Button
              type="button"
              size="sm"
              onClick={startEditing}
              disabled={!user}
            >
              Edit
            </Button>
          )}
        </div>

        <Separator />

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
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
              <AtSign className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
              Use 3–30 lowercase letters, numbers, or underscores.
            </p>
          </div>
        </div>

        {(successMessage || errorMessage) && (
          <div
            role="status"
            className={cn(
              "mx-6 mb-5 rounded-lg px-3 py-2 text-sm",
              successMessage
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {successMessage || errorMessage}
          </div>
        )}

        <Separator />

        {isEditing && (
          <div className="flex justify-end gap-2 px-6 py-4">
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
        )}
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
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
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
      <form
        onSubmit={handlePasswordSubmit}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div className="flex gap-4 px-6 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Change password
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose a password with at least 8 characters, one uppercase
              letter, and one number.
            </p>
          </div>
        </div>

        <div className="border-y border-border bg-muted/20 px-6 py-5">
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
        </div>

        {(passwordMessage || passwordError) && (
          <div
            role="status"
            className={cn(
              "mx-6 mt-5 rounded-lg px-3 py-2 text-sm",
              passwordMessage
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {passwordMessage || passwordError}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            You will need to sign in again after changing your password.
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={changePasswordMutation.isPending}
            className="shrink-0"
          >
            {changePasswordMutation.isPending ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-destructive">
              Delete account
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Permanently remove your account. This action cannot be undone.
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
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Enter your current password to permanently delete your account.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteSubmit} className="mt-5 space-y-4">
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

            <div className="flex justify-end gap-2 pt-1">
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
          <div className="size-8 rounded-lg bg-gray-100" />
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
          <div className="size-8 rounded-lg bg-zinc-800" />
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
  setTheme: (theme: Theme) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground">Color scheme</h2>
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
                "cursor-pointer overflow-hidden rounded-xl border-2 text-left transition-all",
                theme === value
                  ? "border-primary shadow-sm shadow-primary/10"
                  : "border-border hover:bg-emerald-500/5 dark:hover:bg-emerald-400/10",
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
  );
}
