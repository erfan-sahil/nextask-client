export const siteConfig = {
  name: "NexTask",
  tagline: "Project Management for Focused Teams",
  description:
    "NexTask brings workspaces, projects, boards, and tasks into one calm system — so teams can focus on meaningful work, not tool chaos.",
  footerTagline: "Built for teams who value clarity over complexity.",
} as const;

export const siteTitle = {
  default: `${siteConfig.name} — ${siteConfig.tagline}`,
  template: `%s | ${siteConfig.name}`,
} as const;
