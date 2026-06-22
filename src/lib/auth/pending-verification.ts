export const PENDING_VERIFICATION_EMAIL_KEY = 'nextask_pending_verification_email';

export const setPendingVerificationEmail = (email: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
};

export const getPendingVerificationEmail = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
};

export const clearPendingVerificationEmail = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
};
