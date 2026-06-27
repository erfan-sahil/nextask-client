export type NavLink = {
  href: string;
  label: string;
};

export const footerLinkGroups = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#workflow" },
    { label: "Product tour", href: "#product" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  Account: [{ label: "Log in", href: "/login" }],
} as const satisfies Record<string, NavLink[]>;

export const authRoutes = {
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
} as const;

export const appRoutes = {
  dashboard: "/dashboard",
  workspaces: "/workspaces",
  workspace: (slug: string) => `/${slug}`,
  workspaceCalendar: (slug: string) => `/${slug}/calendar`,
  workspaceMembers: (slug: string) => `/${slug}/members`,
  workspaceReports: (slug: string) => `/${slug}/reports`,
  project: (slug: string, projectId: string) => `/${slug}/projects/${projectId}`,
  board: (slug: string, projectId: string, boardId: string) =>
    `/${slug}/projects/${projectId}/boards/${boardId}`,
  settings: "/settings",
  inbox: "/inbox",
} as const;

/** Segments that are app-level routes, not workspace slugs */
export const reservedAppSegments = new Set([
  "dashboard",
  "workspaces",
  "settings",
  "inbox",
  "login",
  "register",
  "verify-email",
  "theme-preview",
]);

export type AppNavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "workspaces" | "projects" | "boards" | "tasks" | "inbox" | "settings";
  section?: "main" | "workspace" | "footer";
};

export const appNavItems: AppNavItem[] = [
  { href: appRoutes.dashboard, label: "Dashboard", icon: "dashboard", section: "main" },
  { href: appRoutes.workspaces, label: "Workspaces", icon: "workspaces", section: "main" },
  { href: appRoutes.inbox, label: "Inbox", icon: "inbox", section: "footer" },
  { href: appRoutes.settings, label: "Settings", icon: "settings", section: "footer" },
];
