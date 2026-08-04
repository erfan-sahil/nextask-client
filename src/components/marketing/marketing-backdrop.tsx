export function MarketingBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-muted dark:bg-background"
    >
      <svg
        className="absolute inset-0 h-full w-full text-primary/20 dark:text-border dark:opacity-55"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="nextask-marketing-dots"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.1" cy="1.1" r="1.1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nextask-marketing-dots)" />
      </svg>
    </div>
  );
}
