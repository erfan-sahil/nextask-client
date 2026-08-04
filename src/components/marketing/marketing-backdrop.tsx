/** Desktop — sweeping S-curves that frame the page horizontally */
const FLIGHT_PATH_PRIMARY =
  "M60 300 C220 140, 420 140, 560 280 C700 420, 860 440, 1000 300 C1140 160, 1280 160, 1400 280";

const FLIGHT_PATH_SECONDARY =
  "M1400 620 C1240 780, 1040 780, 900 640 C760 500, 600 480, 460 620 C320 760, 180 760, 40 640";

/** Mobile — single taller vertical S-curve kept near center */
const FLIGHT_PATH_MOBILE =
  "M620 50 C860 200, 480 340, 700 470 C920 600, 540 740, 780 880";

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

function FlightRoutes({
  pathIds,
  className,
}: {
  pathIds: string[];
  className?: string;
}) {
  return (
    <g className={className}>
      <g
        fill="none"
        className="stroke-primary/10 dark:stroke-primary/8"
        strokeWidth="6"
        strokeLinecap="round"
      >
        {pathIds.map((id) => (
          <use key={`underlay-${id}`} href={`#${id}`} />
        ))}
      </g>
      <g
        fill="none"
        className="stroke-primary/35 dark:stroke-primary/25"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {pathIds.map((id) => (
          <use key={`main-${id}`} href={`#${id}`} />
        ))}
      </g>
      <g
        fill="none"
        className="stroke-primary/20 dark:stroke-primary/14"
        strokeWidth="1"
        strokeDasharray="2 10"
        strokeLinecap="round"
      >
        {pathIds.map((id) => (
          <use key={`dash-${id}`} href={`#${id}`} />
        ))}
      </g>
    </g>
  );
}

function PaperPlanes({
  paths,
  className,
}: {
  paths: { id: string; dur: string; begin?: string; opacity?: number }[];
  className?: string;
}) {
  return (
    <g className={className}>
      {paths.map(({ id, dur, begin, opacity }) => (
        <g key={id} opacity={opacity}>
          <PaperPlane />
          <animateMotion
            dur={dur}
            repeatCount="indefinite"
            rotate="auto"
            calcMode="linear"
            begin={begin}
          >
            <mpath href={`#${id}`} />
          </animateMotion>
        </g>
      ))}
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
          {/* Soft diagonal hatch */}
          <pattern
            id="nextask-scaffold"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(28)"
          >
            <path
              d="M0 0 V28"
              fill="none"
              className="stroke-border/55 dark:stroke-border/40"
              strokeWidth="1"
            />
          </pattern>
          <path id="nextask-flight-primary" d={FLIGHT_PATH_PRIMARY} />
          <path id="nextask-flight-secondary" d={FLIGHT_PATH_SECONDARY} />
          <path id="nextask-flight-mobile" d={FLIGHT_PATH_MOBILE} />
        </defs>

        {/* Quiet scaffold */}
        <rect
          width="1440"
          height="900"
          fill="url(#nextask-scaffold)"
          className="opacity-58 dark:opacity-42"
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

        <FlightRoutes
          className="nextask-flight-desktop"
          pathIds={["nextask-flight-primary", "nextask-flight-secondary"]}
        />
        <FlightRoutes
          className="nextask-flight-mobile"
          pathIds={["nextask-flight-mobile"]}
        />

        <PaperPlanes
          className="nextask-paper-planes nextask-flight-desktop"
          paths={[
            { id: "nextask-flight-primary", dur: "16s" },
            {
              id: "nextask-flight-secondary",
              dur: "20s",
              begin: "4s",
              opacity: 0.8,
            },
          ]}
        />
        <PaperPlanes
          className="nextask-paper-planes nextask-flight-mobile"
          paths={[{ id: "nextask-flight-mobile", dur: "16s" }]}
        />
      </svg>

      <style>{`
        .nextask-flight-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .nextask-flight-desktop {
            display: none;
          }
          .nextask-flight-mobile {
            display: inline;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nextask-paper-planes {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
