import { Radio, X } from "lucide-react";
import { grokipediaUrl } from "@/data/bodyInfo";
import { EXOPLANET_CATALOG } from "@/data/exoplanetCatalog";
import { NEARBY_STARS as STARS } from "@/data/solarSystem";
import { useReveal } from "@/hooks/useReveal";
import type { LightJourneyResult } from "@/lib/lightJourney";

interface JourneyStatsPanelProps {
  open: boolean;
  onClose: () => void;
  result: LightJourneyResult;
  liveLy: number | null;
  reachedStars: typeof STARS;
  nextTarget: (typeof STARS)[number] | undefined;
}

export const JourneyStatsPanel = ({
  open,
  onClose,
  result,
  liveLy,
  reachedStars,
  nextTarget,
}: JourneyStatsPanelProps) => {
  const { ref, className } = useReveal<HTMLDivElement>();

  if (!open) return null;

  const stats = [
    { label: "Your age", value: result.years.toFixed(1), unit: "years old" },
    { label: "Light traveled", value: result.lightYears.toFixed(1), unit: "light-years, at c" },
    {
      label: "Laps of the Sun",
      value: result.totalOrbits.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      unit: "your light, around Earth's orbit",
    },
    {
      label: "Known worlds",
      value: EXOPLANET_CATALOG.galaxyTotal.toLocaleString("en-US"),
      unit: `confirmed exoplanets galaxy-wide (NASA archive, ${EXOPLANET_CATALOG.fetchedAt})`,
    },
  ];

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 max-h-[min(72dvh,32rem)] overflow-y-auto rounded-t-2xl glass md:inset-x-auto md:bottom-4 md:left-4 md:max-h-[calc(100dvh-6rem)] md:w-[min(24rem,calc(100%-2rem))] md:rounded-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0a0c14]/90 px-4 py-3 backdrop-blur-md">
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">Your journey</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground transition-colors hover:text-foreground"
          title="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div ref={ref} className={`${className} space-y-4 p-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((s, i) => (
            <div key={s.label} className="reveal is-visible" style={{ transitionDelay: `${i * 60}ms` }}>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {s.label}
              </p>
              <p className="font-mono-num tnum text-2xl font-semibold tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.unit}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-pulse text-beam" strokeWidth={1.5} />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
          <span className="font-mono-num tnum text-sm font-semibold text-beam">
            {(liveLy ?? result.lightYears).toFixed(7)} ly
          </span>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h3 className="font-display text-sm font-semibold text-foreground">Stars reached</h3>
            <span className="font-mono-num tnum text-xs text-muted-foreground">
              {reachedStars.length}/{STARS.length}
            </span>
          </div>

          {reachedStars.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Still inside the Solar System. The nearest star is light-years away.
            </p>
          ) : (
            <ul className="max-h-40 space-y-1.5 overflow-y-auto">
              {reachedStars.map((s) => (
                <li key={s.name}>
                  <a
                    href={grokipediaUrl(s.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="font-mono-num tnum text-muted-foreground">{s.distance} ly</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {nextTarget && (
            <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted-foreground">
              Next:{" "}
              <a
                href={grokipediaUrl(nextTarget.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                {nextTarget.name}
              </a>{" "}
              in{" "}
              <span className="font-mono-num tnum text-beam">
                {(nextTarget.distance - result.lightYears).toFixed(2)} ly
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};