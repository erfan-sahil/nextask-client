const ACCESS_TOKEN_KEY = "nextask-access-token";
const REFRESH_TOKEN_KEY = "nextask-refresh-token";

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

const canUseStorage = () => typeof window !== "undefined";

export const getAccessToken = (): string | null => {
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  if (!canUseStorage()) {
    return null;
  }

  memoryAccessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return memoryAccessToken;
};

export const getRefreshToken = (): string | null => {
  if (memoryRefreshToken) {
    return memoryRefreshToken;
  }

  if (!canUseStorage()) {
    return null;
  }

  memoryRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  return memoryRefreshToken;
};

export const setAuthTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) => {
  if (accessToken) {
    memoryAccessToken = accessToken;

    if (canUseStorage()) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
  }

  if (refreshToken) {
    memoryRefreshToken = refreshToken;

    if (canUseStorage()) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
};

export const clearAuthTokens = () => {
  memoryAccessToken = null;
  memoryRefreshToken = null;

  if (!canUseStorage()) {
    return;
  }

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Capture tokens from Google OAuth redirect hash
 * (`#accessToken=...&refreshToken=...`) and strip them from the URL.
 */
export const hydrateAuthTokensFromHash = (): boolean => {
  if (!canUseStorage()) {
    return false;
  }

  const hash = window.location.hash.replace(/^#/, "");

  if (!hash) {
    return false;
  }

  const params = new URLSearchParams(hash);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");

  if (!accessToken && !refreshToken) {
    return false;
  }

  setAuthTokens({ accessToken, refreshToken });

  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);

  return true;
};

// Hydrate as soon as this module loads in the browser so the first
// authenticated request can already send Authorization: Bearer.
if (typeof window !== "undefined") {
  hydrateAuthTokensFromHash();
}
