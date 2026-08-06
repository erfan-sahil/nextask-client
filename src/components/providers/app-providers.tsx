"use client";

import { AuthTokenHydrator } from "@/components/providers/auth-token-hydrator";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthTokenHydrator />
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}
