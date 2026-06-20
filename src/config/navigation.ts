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
