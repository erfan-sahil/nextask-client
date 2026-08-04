import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { LandingJsonLd } from "@/components/marketing/seo/landing-json-ld";
import { siteTitle } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: siteTitle.default,
  },
  description:
    "Create workspaces, run projects, organize kanban boards, manage tasks, and collaborate in workspace chat with NexTask.",
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
