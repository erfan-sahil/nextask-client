import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  ProductPreviewSection,
  ProductivitySection,
  WorkflowSection,
} from "@/components/marketing/sections";

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <ProductPreviewSection />
      <ProductivitySection />
      <CtaSection />
    </main>
  );
}
