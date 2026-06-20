export function LandingJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "NexTask",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "NexTask is project management software that helps companies create workspaces, manage multiple projects, and organize tasks effectively.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Company workspaces",
      "Multi-project organization",
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
