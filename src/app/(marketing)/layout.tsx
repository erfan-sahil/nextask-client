import { MarketingBackdrop } from "@/components/marketing/marketing-backdrop";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <MarketingBackdrop />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
