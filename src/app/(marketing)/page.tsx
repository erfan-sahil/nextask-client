import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { LandingJsonLd } from "@/components/marketing/seo/landing-json-ld";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.tagline,
  description:
    "Create company workspaces, run multiple projects, and manage tasks in NexTask — a modern project management platform built for clarity and productivity.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <LandingJsonLd />
      <LandingPage />
    </>
  );
}
