import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Navigation, Rocket, X } from "lucide-react";
import { ModeComparison } from "@/components/ModeComparison";
import { computeMission } from "@/mission/preview";
import { findNavStar, searchNavStars } from "@/mission/stars";
import {
  PROPULSION_MODES,
  VESSEL_PRESETS,
  type MissionState,
  type PropulsionMode,
  type VesselConfig,
} from "@/mission/types";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface MissionPlannerProps {
  open: boolean;
  onToggle: () => void;
  mission: MissionState;
  onChange: (mission: MissionState) => void;
  onNavigate: () => void;
}

export const MissionPlanner = ({ open, onToggle, mission, onChange, onNavigate }: MissionPlannerProps) => {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState(mission.destination ?? "");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(mission.destination ?? "");
  }, [mission.destination]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => searchNavStars(query), [query]);
  const destStar = mission.destination ? findNavStar(mission.destination) : undefined;
  const result = computeMission(destStar, mission.mode, mission.vessel, mission.origin);

  const setDest = (name: string) => {
    onChange({ ...mission, destination: name });
    setQuery(name);
    setShowResults(false);
  };

  const setMode = (mode: PropulsionMode) => onChange({ ...mission, mode });

  const patchVessel = (patch: Partial<VesselConfig>) =>
    onChange({ ...mission, vessel: { ...mission.vessel, ...patch } });

  if (!open) {
    return (
      <button
        onClick={onToggle}
        title="Open star navigator"
        className="pointer-events-auto absolute right-3 top-[calc(6.5rem+env(safe-area-inset-top,0px))] z-20 flex min-h-11 items-center gap-2 rounded-full glass px-4 py-2.5 text-xs font-semibold text-foreground/90 transition-colors hover:text-primary md:right-4 md:top-20"
      >
        <Compass className="h-4 w-4" strokeWidth={1.5} />
        Navigate
      </button>
    );
  }

  return (
    <aside
      className={
        isMobile
          ? "pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[min(78dvh,560px)]"
          : "pointer-events-auto absolute right-4 top-16 z-20 w-[min(20rem,calc(100%-2rem))]"
      }
    >
      <div className={`glass-shell ${isMobile ? "rounded-b-none rounded-t-2xl" : ""}`}>
        <div
          className={`glass-core flex flex-col overflow-hidden ${
            isMobile ? "max-h-[min(78dvh,560px)] pb-[env(safe-area-inset-bottom,0px)]" : "max-h-[calc(100dvh-6rem)]"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-beam" strokeWidth={1.5} />
              <h2 className="font-display text-sm font-semibold tracking-tight">Star Navigator</h2>
            </div>
            <button onClick={onToggle} className="text-muted-foreground transition-colors hover:text-foreground" title="Close">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-3 space-y-4">
            {/* Origin */}
            <Field label="Origin">
              <select
                value={mission.origin}
                onChange={(e) => onChange({ ...mission, origin: e.target.value as MissionState["origin"] })}
                className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-foreground outline-none [color-scheme:dark] focus:border-beam/40"
              >
                <option value="sun">Sun (heliocentric)</option>
                <option value="earth">Earth orbit</option>
              </select>
            </Field>

            {/* Destination search */}
            <Field label="Destination">
              <div ref={searchRef} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search stars…"
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-beam/40"
                />
                {showResults && results.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0c14]/95 py-1 shadow-xl backdrop-blur-md">
                    {results.map((s) => (
                      <li key={s.name}>
                        <button
                          type="button"
                          onClick={() => setDest(s.name)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.06]"
                        >
                          <span className="font-medium text-foreground">{s.name}</span>
                          <span className="font-mono-num tnum shrink-0 text-muted-foreground">{s.distanceLy} ly</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground/70">Or click any star in the map</p>
            </Field>

            {/* Propulsion */}
            <Field label="Propulsion">
              <div className="grid gap-1.5">
                {PROPULSION_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      mission.mode === m.id
                        ? "border-beam/40 bg-beam/[0.08] text-foreground"
                        : "border-white/8 bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      {m.label}
                      {m.speculative && (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-300/90">
                          hypothetical
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[10px] opacity-70">{m.desc}</span>
                  </button>
                ))}
              </div>
            </Field>

            {/* Vessel */}
            <Field label="Vessel mass">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {VESSEL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => patchVessel(p.vessel)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-beam/30 hover:text-beam"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1}
                value={mission.vessel.dryMassKg}
                onChange={(e) => patchVessel({ dryMassKg: Math.max(1, parseFloat(e.target.value) || 1) })}
                className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 font-mono-num tnum text-sm text-foreground outline-none focus:border-beam/40"
              />
              <span className="mt-1 block text-[10px] text-muted-foreground">Dry mass (kg)</span>
            </Field>

            {/* Mode-specific inputs */}
            {mission.mode === "sublight" && (
              <Field label="Sublight fraction of c">
                <input
                  type="range"
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  value={mission.vessel.sublightFraction}
                  onChange={(e) => patchVessel({ sublightFraction: parseFloat(e.target.value) })}
                  className="w-full accent-beam"
                />
                <span className="font-mono-num tnum text-xs text-beam">
                  {(mission.vessel.sublightFraction * 100).toFixed(0)}% c
                </span>
              </Field>
            )}

            {mission.mode === "nuclear" && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Fuel (kg)">
                  <input
                    type="number"
                    min={0}
                    value={mission.vessel.fuelMassKg}
                    onChange={(e) => patchVessel({ fuelMassKg: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full rounded-lg border border-white/10 bg-background/60 px-2 py-1.5 font-mono-num tnum text-xs outline-none focus:border-beam/40"
                  />
                </Field>
                <Field label="ISP (s)">
                  <input
                    type="number"
                    min={100}
                    value={mission.vessel.ispSeconds}
                    onChange={(e) => patchVessel({ ispSeconds: Math.max(100, parseFloat(e.target.value) || 100) })}
                    className="w-full rounded-lg border border-white/10 bg-background/60 px-2 py-1.5 font-mono-num tnum text-xs outline-none focus:border-beam/40"
                  />
                </Field>
                <Field label="Thrust (N)">
                  <input
                    type="number"
                    min={1000}
                    value={mission.vessel.thrustN}
                    onChange={(e) => patchVessel({ thrustN: Math.max(1000, parseFloat(e.target.value) || 1000) })}
                    className="col-span-2 w-full rounded-lg border border-white/10 bg-background/60 px-2 py-1.5 font-mono-num tnum text-xs outline-none focus:border-beam/40"
                  />
                </Field>
              </div>
            )}

            {mission.mode === "gravity_assist" && (
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                Route includes Jupiter (+9.2 km/s) and Saturn (+4.8 km/s) flybys, plus 60% of onboard fuel for a departure burn.
              </p>
            )}

            {mission.mode === "solar_sail" && (
              <Field label="Sail area (m²)">
                <input
                  type="number"
                  min={100}
                  value={mission.vessel.sailAreaM2}
                  onChange={(e) => patchVessel({ sailAreaM2: Math.max(100, parseFloat(e.target.value) || 100) })}
                  className="w-full rounded-lg border border-white/10 bg-background/60 px-3 py-2 font-mono-num tnum text-sm outline-none focus:border-beam/40"
                />
              </Field>
            )}

            {mission.mode === "alcubierre" && (
              <Field label="Warp factor">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={mission.vessel.warpFactor}
                  onChange={(e) => patchVessel({ warpFactor: parseFloat(e.target.value) })}
                  className="w-full accent-beam"
                />
                <span className="font-mono-num tnum text-xs text-beam">×{mission.vessel.warpFactor.toFixed(1)}</span>
              </Field>
            )}

            {destStar && (
              <ModeComparison
                dest={destStar}
                vessel={mission.vessel}
                origin={mission.origin}
                activeMode={mission.mode}
                onSelectMode={setMode}
              />
            )}

            {/* Route summary */}
            {result && (
              <div className="rounded-xl border border-beam/20 bg-beam/[0.05] px-3 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-beam/80">Mission profile</p>
                <div className="mt-2 grid gap-1.5">
                  <StatRow label="Distance" value={`${result.distanceLy.toFixed(2)} ly`} />
                  <StatRow label="ETA" value={result.etaLabel} accent />
                  {result.cruiseSpeedKms != null && (
                    <StatRow label="Cruise speed" value={`${result.cruiseSpeedKms.toLocaleString("en-US", { maximumFractionDigits: 1 })} km/s`} />
                  )}
                  {result.deltaVKms != null && (
                    <StatRow label="Total Δv" value={`${result.deltaVKms.toLocaleString("en-US", { maximumFractionDigits: 1 })} km/s`} />
                  )}
                  {result.fuelUsedKg != null && result.fuelUsedKg > 0 && (
                    <StatRow label="Propellant" value={`${(result.fuelUsedKg / 1000).toFixed(2)} t`} />
                  )}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{result.etaDetail}</p>

                {result.legs.length > 0 && (
                  <div className="mt-3 border-t border-beam/15 pt-2.5">
                    <p className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">Legs</p>
                    <ol className="space-y-1.5">
                      {result.legs.map((leg, i) => (
                        <li key={leg.label} className="text-[10px] leading-snug text-muted-foreground">
                          <span className="font-medium text-foreground/90">{i + 1}. {leg.label}</span>
                          <span className="block opacity-80">{leg.detail}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {result.warnings.map((w) => (
                  <p key={w} className="mt-2 text-[10px] text-amber-300/90">⚠ {w}</p>
                ))}
                {result.speculative && (
                  <p className="mt-1.5 text-[10px] text-amber-300/80">Hypothetical physics — wonder over precision</p>
                )}
                {!result.feasible && (
                  <p className="mt-1.5 text-[10px] text-destructive/90">Trip likely infeasible with current parameters</p>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={!mission.destination}
              onClick={onNavigate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-beam py-2.5 text-sm font-semibold text-[#04050c] transition-all hover:shadow-[0_6px_24px_-6px_hsl(var(--beam)/0.6)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Rocket className="h-4 w-4" strokeWidth={2} />
              Fly to {destStar?.name ?? "destination"}
            </button>

            {!mission.destination && (
              <p className="text-center text-[10px] text-muted-foreground/60">
                Pick a destination to plot your course
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    {children}
  </div>
);

const StatRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`font-mono-num tnum text-sm font-semibold ${accent ? "text-beam" : "text-foreground"}`}>{value}</span>
  </div>
);