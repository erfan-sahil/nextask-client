import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

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
  title: {
    default: "NexTask — Project Management for Focused Teams",
    template: "%s | NexTask",
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
  authors: [{ name: "NexTask" }],
  creator: "NexTask",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NexTask",
    title: "NexTask — Project Management for Focused Teams",
    description:
      "Create workspaces, run multiple projects, organize work on kanban boards, and manage tasks in one calm, focused platform built for modern teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexTask — Project Management for Focused Teams",
    description:
      "Workspaces, projects, boards, and tasks — organized the way your team actually thinks.",
  },
  robots: {
    index: true,
    follow: true,
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nextask-theme");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
