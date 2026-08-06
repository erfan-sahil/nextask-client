import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig, siteTitle } from "@/config/site";
import newIcon from "./new-icon.png";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  applicationName: siteConfig.name,
  title: {
    default: siteTitle.default,
    template: siteTitle.template,
  },
  description:
    "NexTask helps companies organize work through workspaces, projects, boards, and tasks. Plan clearly, collaborate calmly, and ship with less mental clutter.",
  keywords: [
    "project management",
    "task management",
    "kanban boards",
    "workspace software",
    "team productivity",
    "NexTask",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteTitle.default,
    description:
      "Create workspaces, run multiple projects, organize work on kanban boards, and manage tasks in one calm, focused platform built for modern teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle.default,
    description:
      "Workspaces, projects, boards, and tasks — organized the way your team actually thinks.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: newIcon.src,
    apple: newIcon.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="nextask-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nextask-theme");if(t!=="light")document.documentElement.classList.add("dark");}catch(e){document.documentElement.classList.add("dark");}})();`,
          }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
