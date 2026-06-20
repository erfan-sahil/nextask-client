import type { Metadata } from "next";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingJsonLd } from "@/components/landing/landing-json-ld";
import { ProductPreviewSection } from "@/components/landing/product-preview-section";
import { ProductivitySection } from "@/components/landing/productivity-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { WorkflowSection } from "@/components/landing/workflow-section";

export const metadata: Metadata = {
  title: "Project Management for Focused Teams",
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
      <div className="flex min-h-full flex-1 flex-col">
        <SiteNavbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <WorkflowSection />
          <ProductPreviewSection />
          <ProductivitySection />
          <CtaSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
