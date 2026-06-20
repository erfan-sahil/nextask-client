import { siteConfig } from "@/config/site";

export function LandingJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "NexTask is project management software that helps companies create workspaces, manage multiple projects, organize work on kanban boards, and track tasks effectively.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Company workspaces",
      "Multi-project organization",
      "Kanban boards",
      "Task management",
      "Team collaboration",
      "Focused dashboards",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
