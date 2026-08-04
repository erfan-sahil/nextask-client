/** Shared visual + motion paths — sweeping S-curves that frame the page */
const FLIGHT_PATH_PRIMARY =
  "M60 300 C220 140, 420 140, 560 280 C700 420, 860 440, 1000 300 C1140 160, 1280 160, 1400 280";

const FLIGHT_PATH_SECONDARY =
  "M1400 620 C1240 780, 1040 780, 900 640 C760 500, 600 480, 460 620 C320 760, 180 760, 40 640";

function PaperPlane({ className }: { className?: string }) {
  return (
    <g className={className}>
      {/* Classic paper plane, nose pointing +X for rotate="auto" */}
      <path
        d="M14 0 L-11 -6.5 L-5.5 0 L-11 6.5 Z"
        className="fill-primary"
      />
      <path
        d="M-5.5 0 L-11 -6.5 L-11 6.5 Z"
        className="fill-primary-hover"
        opacity="0.55"
      />
      <path
        d="M14 0 L-5.5 0"
        fill="none"
        className="stroke-primary-foreground/40"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export function MarketingBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-background"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="nextask-fine-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0 H0 V40"
              fill="none"
              className="stroke-border/50 dark:stroke-border/40"
              strokeWidth="1"
            />
          </pattern>
          <path id="nextask-flight-primary" d={FLIGHT_PATH_PRIMARY} />
          <path id="nextask-flight-secondary" d={FLIGHT_PATH_SECONDARY} />
        </defs>

        {/* Quiet scaffold */}
        <rect
          width="1440"
          height="900"
          fill="url(#nextask-fine-grid)"
          className="opacity-40 dark:opacity-30"
        />

        {/* Edge frame */}
        <rect
          x="36"
          y="36"
          width="1368"
          height="828"
          fill="none"
          className="stroke-border/70 dark:stroke-border/50"
          strokeWidth="1"
        />

        {/* Corner brackets */}
        <g
          fill="none"
          className="stroke-primary/45 dark:stroke-primary/30"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <path d="M36 96 V36 H96" />
          <path d="M1344 36 H1404 V96" />
          <path d="M36 804 V864 H96" />
          <path d="M1344 864 H1404 V804" />
        </g>

        {/* Isometric clusters — weight at the edges, clear center */}
        <g
          fill="none"
          className="stroke-border dark:stroke-border/80"
          strokeWidth="1.25"
        >
          <path d="M100 110 L170 75 L240 110 L170 145 Z" />
          <path d="M170 145 L240 110 L310 145 L240 180 Z" />
          <path d="M240 110 L310 75 L380 110 L310 145 Z" />
          <path
            d="M170 75 L240 110 L170 145 L100 110 Z"
            className="fill-primary/5 dark:fill-primary/10"
          />

          <path d="M1060 95 L1130 60 L1200 95 L1130 130 Z" />
          <path d="M1130 130 L1200 95 L1270 130 L1200 165 Z" />
          <path d="M1200 95 L1270 60 L1340 95 L1270 130 Z" />
          <path
            d="M1130 60 L1200 95 L1130 130 L1060 95 Z"
            className="fill-primary/5 dark:fill-primary/10"
          />

          <path d="M90 690 L160 655 L230 690 L160 725 Z" />
          <path d="M160 725 L230 690 L300 725 L230 760 Z" />
          <path d="M230 690 L300 655 L370 690 L300 725 Z" />
          <path
            d="M160 655 L230 690 L160 725 L90 690 Z"
            className="fill-primary/5 dark:fill-primary/10"
          />

          <path d="M1080 700 L1150 665 L1220 700 L1150 735 Z" />
          <path d="M1150 735 L1220 700 L1290 735 L1220 770 Z" />
          <path
            d="M1150 665 L1220 700 L1150 735 L1080 700 Z"
            className="fill-primary/5 dark:fill-primary/10"
          />
        </g>

        {/* Soft underlay strokes */}
        <g
          fill="none"
          className="stroke-primary/10 dark:stroke-primary/8"
          strokeWidth="6"
          strokeLinecap="round"
        >
          <use href="#nextask-flight-primary" />
          <use href="#nextask-flight-secondary" />
        </g>

        {/* Main flight routes */}
        <g
          fill="none"
          className="stroke-primary/35 dark:stroke-primary/25"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <use href="#nextask-flight-primary" />
          <use href="#nextask-flight-secondary" />
        </g>

        {/* Dashed accent overlay */}
        <g
          fill="none"
          className="stroke-primary/20 dark:stroke-primary/14"
          strokeWidth="1"
          strokeDasharray="2 10"
          strokeLinecap="round"
        >
          <use href="#nextask-flight-primary" />
          <use href="#nextask-flight-secondary" />
        </g>

        {/* Paper planes following the routes */}
        <g className="nextask-paper-planes">
          <g>
            <PaperPlane />
            <animateMotion
              dur="16s"
              repeatCount="indefinite"
              rotate="auto"
              calcMode="linear"
            >
              <mpath href="#nextask-flight-primary" />
            </animateMotion>
          </g>
          <g opacity="0.8">
            <PaperPlane />
            <animateMotion
              dur="20s"
              repeatCount="indefinite"
              rotate="auto"
              calcMode="linear"
              begin="4s"
            >
              <mpath href="#nextask-flight-secondary" />
            </animateMotion>
          </g>
        </g>
      </svg>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .nextask-paper-planes {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
