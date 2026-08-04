export const siteConfig = {
  name: "NexTask",
  tagline: "Project Management for Focused Teams",
  description:
    "NexTask is a calm project management platform that helps teams plan clearly, track progress, and stay aligned.",
  footerTagline: "Built for teams who value clarity over complexity.",
} as const;

export const siteTitle = {
  default: `${siteConfig.name} — ${siteConfig.tagline}`,
  template: `%s | ${siteConfig.name}`,
} as const;
