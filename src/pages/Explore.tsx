import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Volume2, VolumeX } from "lucide-react";
import type { SolarSystemHandle } from "@/components/SolarSystem";
import { NEARBY_STARS as STARS } from "@/data/solarSystem";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JourneyStatsPanel } from "@/components/JourneyStatsPanel";
import { RouteHUD } from "@/components/RouteHUD";
import { useAmbient } from "@/hooks/useAmbient";
import {
  computeLightJourney,
  nextStar,
  starsReached,
  type LightJourneyResult,
} from "@/lib/lightJourney";
import { computeMission } from "@/mission/preview";
import { findNavStar } from "@/mission/stars";
import { buildAppShareQuery, parseAppUrl } from "@/mission/url";
import { DEFAULT_VESSEL, type MissionState } from "@/mission/types";
import type { AccuracyMode } from "@/lib/accuracyMode";

const VISUAL_TRIP_MS = 36_000;

const SolarSystem = lazy(() =>
  import("@/components/SolarSystem").then((m) => ({ default: m.SolarSystem })),
);
const MissionPlanner = lazy(() =>
  import("@/components/MissionPlanner").then((m) => ({ default: m.MissionPlanner })),
);
const TechnicalReadme = lazy(() =>
  import("@/components/TechnicalReadme").then((m) => ({ default: m.TechnicalReadme })),
);

const SceneLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#04050c] text-sm text-muted-foreground">
    Loading the sky…
  </div>
);

const Explore = () => {
  const [bday, setBday] = useState("");
  const [useLeap, setUseLeap] = useState(true);
  const [result, setResult] = useState<LightJourneyResult | null>(null);
  const [error, setError] = useState("");
  const [liveLy, setLiveLy] = useState<number | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(
    () => typeof window !== "undefined" && !!new URLSearchParams(window.location.search).get("dest"),
  );
  const initialUrl =
    typeof window !== "undefined" ? parseAppUrl(new URLSearchParams(window.location.search)) : null;
  const [mission, setMission] = useState<MissionState>(
    () => initialUrl?.mission ?? { origin: "sun", destination: null, mode: "sublight", vessel: { ...DEFAULT_VESSEL } },
  );
  const [flyInUrl, setFlyInUrl] = useState(() => initialUrl?.fly ?? false);
  const [accuracyMode, setAccuracyMode] = useState<AccuracyMode>(
    () => initialUrl?.accuracy ?? "cinematic",
  );
  const [trueOrbits, setTrueOrbits] = useState(() => initialUrl?.trueOrbits ?? false);
  const { muted, toggle } = useAmbient();
  const systemRef = useRef<SolarSystemHandle>(null);
  const hasJourney = useRef(false);
  const autoFlyPending = useRef(initialUrl?.fly ?? false);

  const syncUrl = (birth?: string, leap?: boolean, fly?: boolean) => {
    try {
      const qs = buildAppShareQuery({
        bday: birth ?? (bday || undefined),
        useLeap: leap ?? useLeap,
        mission,
        fly: fly ?? flyInUrl,
        accuracy: accuracyMode,
        trueOrbits,
      });
      window.history.replaceState(null, "", `/explore${qs}`);
    } catch {
      /* ignore */
    }
  };

  const applyJourney = (birth: string, leap: boolean) => {
    const r = computeLightJourney(birth, leap);
    if (!r) {
      setError("Your birthday has to be in the past.");
      setResult(null);
      return false;
    }
    setError("");
    setResult(r);
    hasJourney.current = true;
    syncUrl(birth, leap);
    return true;
  };

  const calculate = () => {
    if (!bday) {
      setError("Pick your birthday to begin.");
      return;
    }
    applyJourney(bday, useLeap);
  };

  useEffect(() => {
    const { bday: b, leap, mission: m, accuracy, trueOrbits: orbits } = parseAppUrl(
      new URLSearchParams(window.location.search),
    );
    setMission(m);
    setAccuracyMode(accuracy);
    setTrueOrbits(orbits);
    if (m.destination) setPlannerOpen(true);
    if (b) {
      setBday(b);
      setUseLeap(leap);
      applyJourney(b, leap);
    }
  }, []);

  useEffect(() => {
    if (!hasJourney.current && !mission.destination) return;
    syncUrl();
  }, [mission, flyInUrl, accuracyMode, trueOrbits]);

  useEffect(() => {
    if (!hasJourney.current || !bday) return;
    applyJourney(bday, useLeap);
  }, [useLeap]);

  useEffect(() => {
    if (!result) return;
    const id = setInterval(() => {
      const r = computeLightJourney(bday, useLeap);
      if (r) setLiveLy(r.lightYears);
    }, 1000);
    return () => clearInterval(id);
  }, [result, bday, useLeap]);

  const reachedStars = result ? starsReached(STARS, result.lightYears) : [];
  const nextTarget = result ? nextStar(STARS, result.lightYears) : undefined;

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#04050c]">
      <Suspense fallback={null}>
        <TechnicalReadme open={readmeOpen} onClose={() => setReadmeOpen(false)} />
      </Suspense>

      <ExploreScene
        systemRef={systemRef}
        lightYears={result?.lightYears ?? 0}
        bday={bday}
        mission={mission}
        onMissionChange={setMission}
        plannerOpen={plannerOpen}
        onPlannerToggle={() => setPlannerOpen((v) => !v)}
        autoFlyPending={autoFlyPending}
        onFlyUrlChange={(fly) => {
          setFlyInUrl(fly);
          syncUrl(undefined, undefined, fly);
        }}
        onPlannerOpen={() => setPlannerOpen(true)}
        accuracyMode={accuracyMode}
        onAccuracyModeChange={setAccuracyMode}
        trueOrbits={trueOrbits}
        onTrueOrbitsChange={setTrueOrbits}
      />

      {/* Top chrome — minimal */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-4 md:pt-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="flex h-10 items-center gap-1.5 rounded-full glass px-3 text-xs font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Home
          </Link>

          <div className="flex items-center gap-1.5 rounded-full glass p-1 pl-3">
            <input
              id="explore-bday"
              type="date"
              value={bday}
              onChange={(e) => setBday(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              aria-label="Your birthday"
              className="min-h-9 min-w-0 w-[8.5rem] rounded-full border-0 bg-transparent text-xs text-foreground outline-none [color-scheme:dark]"
            />
            <button
              onClick={calculate}
              className="min-h-9 shrink-0 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground transition-all active:scale-[0.97]"
            >
              {result ? "Update" : "Go"}
            </button>
          </div>

          {error && (
            <p className="rounded-full glass px-3 py-1.5 text-[11px] text-destructive">{error}</p>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {result && (
            <button
              onClick={() => setStatsOpen((v) => !v)}
              className={`flex h-10 items-center gap-1.5 rounded-full glass px-3 text-xs font-medium transition-colors ${
                statsOpen ? "text-primary" : "text-foreground/80 hover:text-primary"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="font-mono-num tnum hidden sm:inline">
                {(liveLy ?? result.lightYears).toFixed(1)} ly
              </span>
            </button>
          )}

          <button
            onClick={toggle}
            title={muted ? "Unmute" : "Mute"}
            className="flex h-10 w-10 items-center justify-center rounded-full glass text-foreground/80 transition-colors hover:text-primary"
          >
            {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Volume2 className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {result && (
        <JourneyStatsPanel
          open={statsOpen}
          onClose={() => setStatsOpen(false)}
          result={result}
          liveLy={liveLy}
          reachedStars={reachedStars}
          nextTarget={nextTarget}
        />
      )}
    </main>
  );
};

const ExploreScene = ({
  systemRef,
  lightYears,
  bday,
  mission,
  onMissionChange,
  plannerOpen,
  onPlannerToggle,
  autoFlyPending,
  onFlyUrlChange,
  onPlannerOpen,
  accuracyMode,
  onAccuracyModeChange,
  trueOrbits,
  onTrueOrbitsChange,
}: {
  systemRef: React.RefObject<SolarSystemHandle>;
  lightYears: number;
  bday: string;
  mission: MissionState;
  onMissionChange: (m: MissionState) => void;
  plannerOpen: boolean;
  onPlannerToggle: () => void;
  autoFlyPending: React.MutableRefObject<boolean>;
  onFlyUrlChange: (fly: boolean) => void;
  onPlannerOpen: () => void;
  accuracyMode: AccuracyMode;
  onAccuracyModeChange: (mode: AccuracyMode) => void;
  trueOrbits: boolean;
  onTrueOrbitsChange: (value: boolean) => void;
}) => {
  const [tripProgress, setTripProgress] = useState(0);
  const [missionFlying, setMissionFlying] = useState(false);
  const flightStart = useRef<number | null>(null);
  const flightFrom = useRef(0);
  const flightRaf = useRef<number>(0);

  const destStar = mission.destination ? findNavStar(mission.destination) : undefined;
  const missionResult = useMemo(
    () => (destStar ? computeMission(destStar, mission.mode, mission.vessel, mission.origin) : null),
    [destStar, mission.mode, mission.vessel, mission.origin],
  );

  const stopFlight = () => {
    setMissionFlying(false);
    flightStart.current = null;
    if (flightRaf.current) cancelAnimationFrame(flightRaf.current);
    onFlyUrlChange(false);
  };

  const startFlight = (reset = false) => {
    if (!mission.destination) return;
    if (reset) {
      setTripProgress(0);
      flightFrom.current = 0;
    } else {
      flightFrom.current = tripProgress;
    }
    setMissionFlying(true);
    flightStart.current = null;
    onFlyUrlChange(true);
    systemRef.current?.focusDestination(mission.destination);
  };

  useEffect(() => {
    if (!autoFlyPending.current || !mission.destination || !missionResult) return;
    autoFlyPending.current = false;
    const t = window.setTimeout(() => startFlight(true), 900);
    return () => window.clearTimeout(t);
  }, [mission.destination, missionResult]);

  useEffect(() => {
    if (!missionFlying) return;

    const tick = (now: number) => {
      if (flightStart.current === null) flightStart.current = now;
      const frac = Math.min(1, (now - flightStart.current) / VISUAL_TRIP_MS);
      const p = flightFrom.current + (1 - flightFrom.current) * frac;
      setTripProgress(p);
      if (frac < 1) {
        flightRaf.current = requestAnimationFrame(tick);
      } else {
        setMissionFlying(false);
        flightStart.current = null;
        onFlyUrlChange(false);
      }
    };

    flightRaf.current = requestAnimationFrame(tick);
    return () => {
      if (flightRaf.current) cancelAnimationFrame(flightRaf.current);
    };
  }, [missionFlying]);

  useEffect(() => {
    setTripProgress(0);
    stopFlight();
  }, [mission.destination, mission.mode]);

  return (
    <div className="absolute inset-0">
      <ErrorBoundary
        fallback={
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-foreground">
              This view needs WebGL, which looks disabled here.
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Enable hardware acceleration or try a different browser.
            </p>
          </div>
        }
      >
        <Suspense fallback={<SceneLoader />}>
          <SolarSystem
            ref={systemRef}
            lightYears={lightYears}
            birthDate={bday}
            destination={mission.destination}
            missionResult={missionResult}
            tripProgress={tripProgress}
            missionFlying={missionFlying}
            missionMode={mission.mode}
            missionOrigin={mission.origin}
            missionVessel={mission.vessel}
            onDestinationSelect={(name) =>
              onMissionChange({ ...mission, destination: name })
            }
            onSetMissionDestination={(name) => {
              onMissionChange({ ...mission, destination: name });
              onPlannerOpen();
            }}
            accuracyMode={accuracyMode}
            onAccuracyModeChange={onAccuracyModeChange}
            trueOrbitsManual={trueOrbits}
            onTrueOrbitsChange={onTrueOrbitsChange}
          />
        </Suspense>
      </ErrorBoundary>

      {missionResult && mission.destination && (
        <RouteHUD
          origin={mission.origin}
          destination={mission.destination}
          result={missionResult}
          progress={tripProgress}
          flying={missionFlying}
          onProgressChange={(p) => {
            stopFlight();
            setTripProgress(p);
          }}
          onPlayPause={() => {
            if (missionFlying) stopFlight();
            else startFlight(false);
          }}
          onStop={() => {
            stopFlight();
            setTripProgress(0);
          }}
        />
      )}

      <Suspense fallback={null}>
        <MissionPlanner
          open={plannerOpen}
          onToggle={onPlannerToggle}
          mission={mission}
          onChange={onMissionChange}
          onNavigate={() => startFlight(true)}
        />
      </Suspense>
    </div>
  );
};

export default Explore;