"use client";

import { useEffect } from "react";
import { resetAuthRefreshState } from "@/lib/api/client";
import { hydrateAuthTokensFromHash } from "@/lib/auth/token-storage";

/**
 * Picks up access/refresh tokens from Google OAuth redirect hashes
 * before authenticated queries run.
 */
export function AuthTokenHydrator() {
  useEffect(() => {
    if (hydrateAuthTokensFromHash()) {
      resetAuthRefreshState();
    }
  }, []);

  return null;
}
