import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  ProductPreviewSection,
} from "@/components/marketing/sections";

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <CtaSection />
    </main>
  );
}
