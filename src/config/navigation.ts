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
  workspaces: "/dashboard#workspaces",
  projects: "/dashboard#projects",
  boards: "/dashboard#boards",
  tasks: "/dashboard#tasks",
  comments: "/dashboard#comments",
} as const;

export type AppNavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "workspaces" | "projects" | "boards" | "tasks" | "inbox" | "settings";
  section?: "main" | "workspace" | "footer";
};

export const appNavItems: AppNavItem[] = [
  { href: appRoutes.dashboard, label: "Dashboard", icon: "dashboard", section: "main" },
  { href: appRoutes.workspaces, label: "Workspaces", icon: "workspaces", section: "main" },
  { href: appRoutes.projects, label: "Projects", icon: "projects", section: "workspace" },
  { href: appRoutes.boards, label: "Boards", icon: "boards", section: "workspace" },
  { href: appRoutes.tasks, label: "Tasks", icon: "tasks", section: "workspace" },
  { href: "/dashboard#inbox", label: "Inbox", icon: "inbox", section: "workspace" },
  { href: "/dashboard#settings", label: "Settings", icon: "settings", section: "footer" },
];
