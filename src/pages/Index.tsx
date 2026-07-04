import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Radio, Volume2, VolumeX } from "lucide-react";
import { StarField } from "@/components/StarField";
import { SolarSystem, type SolarSystemHandle } from "@/components/SolarSystem";
import { TechnicalReadme } from "@/components/TechnicalReadme";
import { NEARBY_STARS as STARS } from "@/data/solarSystem";
import { grokipediaUrl } from "@/data/bodyInfo";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useReveal } from "@/hooks/useReveal";
import { useAmbient } from "@/hooks/useAmbient";
import { SECONDS_PER_ORBIT } from "@/lib/constants";

interface Result {
  years: number;
  orbitsPerYear: number;
  totalOrbits: number;
  lightYears: number;
}

const Index = () => {
  const [bday, setBday] = useState("");
  const [useLeap, setUseLeap] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [liveLy, setLiveLy] = useState<number | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { muted, toggle } = useAmbient();
  const systemRef = useRef<SolarSystemHandle>(null);
  const systemSectionRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const compute = (birthStr: string, leap: boolean): Result | null => {
    if (!birthStr) return null;
    const birth = new Date(birthStr);
    const now = new Date();
    if (birth > now) return null;
    const ageSeconds = (now.getTime() - birth.getTime()) / 1000;
    const daysPerYear = leap ? 365.25 : 365;
    const secPerYear = daysPerYear * 86400;
    const years = ageSeconds / secPerYear;
    const orbitsPerYear = secPerYear / SECONDS_PER_ORBIT;
    const totalOrbits = ageSeconds / SECONDS_PER_ORBIT;
    return { years, orbitsPerYear, totalOrbits, lightYears: years };
  };

  const calculate = () => {
    if (!bday) {
      setError("Pick your birthday to begin.");
      return;
    }
    const r = compute(bday, useLeap);
    if (!r) {
      setError("Your birthday has to be in the past.");
      return;
    }
    setError("");
    setResult(r);
    // Deep-link: encode the birthday so the journey is shareable / restorable.
    try { window.history.replaceState(null, "", `?b=${bday}`); } catch { /* ignore */ }
    // Fly to the unified scene; SolarSystem auto-frames + expands the light when
    // the new lightYears lands (see its effect on lightYears).
    requestAnimationFrame(() =>
      systemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  // On load: restore a shared birthday from the URL, and show a first-visit hint.
  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get("b");
    if (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) {
      setBday(b);
      const r = compute(b, true);
      if (r) {
        setResult(r);
        requestAnimationFrame(() => systemSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    } else if (!localStorage.getItem("blj_seen")) {
      setShowHint(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissHint = () => { setShowHint(false); try { localStorage.setItem("blj_seen", "1"); } catch { /* ignore */ } };

  // Live ticker — updates every second once a result exists.
  useEffect(() => {
    if (!result) return;
    const id = setInterval(() => {
      const r = compute(bday, useLeap);
      if (r) setLiveLy(r.lightYears);
    }, 1000);
    return () => clearInterval(id);
  }, [result, bday, useLeap]);

  const reachedStars = result ? STARS.filter((s) => s.distance <= result.lightYears) : [];
  const nextStar = result ? STARS.find((s) => s.distance > result.lightYears) : undefined;

  return (
    <main className="relative overflow-x-hidden">
      <StarField />
      <div className="grain-overlay" />

      <TechnicalReadme open={readmeOpen} onClose={() => setReadmeOpen(false)} />

      {/* Ambient-sound mute toggle — fixed, always reachable */}
      <button
        onClick={toggle}
        title={muted ? "Unmute ambient sound" : "Mute ambient sound"}
        className="fixed bottom-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full glass text-foreground/80 transition-colors hover:text-primary"
      >
        {muted ? <VolumeX className="h-4 w-4" strokeWidth={1.5} /> : <Volume2 className="h-4 w-4" strokeWidth={1.5} />}
      </button>

      {/* First-visit onboarding nudge */}
      {showHint && (
        <div className="fixed bottom-5 left-1/2 z-[70] w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl glass p-4 text-center">
          <p className="text-sm text-foreground">Enter your birthday, watch your light travel, and click any world for details.</p>
          <button onClick={dismissHint} className="mt-2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-transform active:scale-95">
            Got it
          </button>
        </div>
      )}
      {/* Ambient aurora orbs — drift slowly, GPU-only transforms. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="animate-aurora absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(42_90%_50%/0.16),transparent_65%)] blur-2xl" />
        <div className="animate-aurora absolute bottom-[-12rem] right-[-8rem] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,hsl(180_80%_45%/0.12),transparent_65%)] blur-2xl [animation-delay:-7s]" />
      </div>

      {/* ============================== HERO ============================== */}
      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-5xl flex-col items-center justify-center px-5 py-24 text-center">
        <span className="animate-float-up mb-8 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary/90">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          A cosmic birthday gift
        </span>

        <h1
          className="animate-float-up font-display text-[clamp(2.75rem,9vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.03em] text-balance [animation-delay:0.08s]"
          style={{ opacity: 0 }}
        >
          How far has your
          <br />
          <span className="text-gradient">light traveled?</span>
        </h1>

        <p
          className="animate-float-up mx-auto mt-7 max-w-[34rem] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:0.16s]"
          style={{ opacity: 0 }}
        >
          If a beam of light circled the Sun once every birthday since you were
          born, it would be deep among the stars by now. Enter your birthday and
          trace its journey.
        </p>

        {/* Glass-island input — the form as part of the show. */}
        <div
          className="animate-float-up glass-shell mt-12 w-full max-w-xl [animation-delay:0.24s]"
          style={{ opacity: 0 }}
        >
          <div className="glass-core p-6 sm:p-8">
            <label
              htmlFor="bday"
              className="block text-left text-sm font-medium text-foreground/80"
            >
              When were you born?
            </label>
            <div className="mt-2.5 flex flex-col gap-3 sm:flex-row">
              <input
                id="bday"
                type="date"
                value={bday}
                onChange={(e) => setBday(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-12 flex-1 rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-base text-foreground outline-none ring-primary/50 transition-all duration-300 [color-scheme:dark] focus:border-primary/40 focus:ring-2"
              />
              <button
                onClick={calculate}
                className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-primary py-3 pl-5 pr-2.5 font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all duration-500 ease-fluid hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.75)] active:scale-[0.98]"
              >
                See my Light
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                </span>
              </button>
            </div>

            <label className="mt-3.5 flex cursor-pointer items-center gap-2.5 text-left text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={useLeap}
                onChange={(e) => setUseLeap(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-white/20 bg-background/60 accent-primary [color-scheme:dark]"
              />
              Account for leap years (365.25 days)
            </label>

            {error && (
              <p className="mt-3 text-left text-sm text-destructive">{error}</p>
            )}

            <div className="mt-3 text-left">
              <button
                onClick={() => setReadmeOpen(true)}
                className="text-[11px] text-muted-foreground/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
              >
                How this works — the calculations &amp; assumptions
              </button>
            </div>
          </div>
        </div>

        {!result && (
          <div className="animate-float-up mt-16 flex flex-col items-center gap-2 text-muted-foreground/60 [animation-delay:0.4s]">
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll begins after you calculate</span>
          </div>
        )}
      </section>

      {/* ============== UNIFIED SOLAR SYSTEM + STAR NEIGHBOURHOOD ============== */}
      <SolarSystemSection
        sectionRef={systemSectionRef}
        systemRef={systemRef}
        lightYears={result?.lightYears ?? 0}
        bday={bday}
        setBday={setBday}
        calculate={calculate}
        error={error}
        onReadme={() => setReadmeOpen(true)}
      />

      {/* ============================ RESULTS ============================ */}
      {result && (
        <section
          ref={resultsRef}
          className="relative z-10 mx-auto max-w-5xl scroll-mt-8 px-5 pb-32"
        >
          <Stats result={result} liveLy={liveLy} />

          <ReachPanel reachedStars={reachedStars} nextStar={nextStar} result={result} />
        </section>
      )}

      <footer className="relative z-10 border-t border-white/5 px-5 py-10 text-center text-xs text-muted-foreground/60">
        Light travels 1,079,252,848.8 km/h — 9.46 trillion km a year. Distances and
        stars are approximate, for wonder over precision.
      </footer>
    </main>
  );
};

/* ----------------- Unified solar system + star neighbourhood ---------------- */
const SolarSystemSection = ({
  sectionRef,
  systemRef,
  lightYears,
  bday,
  setBday,
  calculate,
  error,
  onReadme,
}: {
  sectionRef: React.RefObject<HTMLDivElement>;
  systemRef: React.RefObject<SolarSystemHandle>;
  lightYears: number;
  bday: string;
  setBday: (v: string) => void;
  calculate: () => void;
  error: string;
  onReadme: () => void;
}) => {
  return (
    <section ref={sectionRef} className="relative z-10 h-[100dvh] w-full">
      <ErrorBoundary
        fallback={
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#04050c] px-6 text-center">
            <p className="text-sm font-medium text-foreground">
              This view needs WebGL, which looks disabled here.
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Enable hardware acceleration or try a different browser to fly from
              the Sun out to the nearest stars.
            </p>
          </div>
        }
      >
        <SolarSystem ref={systemRef} lightYears={lightYears} birthDate={bday} />
      </ErrorBoundary>

      {/* always-visible birthday input (heading removed — it repeated the hero) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 px-5 pt-5 text-center">
        {/* birthday entry — pinned here so it's always findable */}
        <div className="pointer-events-auto mt-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 rounded-full glass p-1.5 pl-4">
            <label htmlFor="bday-overlay" className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
              Your birthday
            </label>
            <input
              id="bday-overlay"
              type="date"
              value={bday}
              onChange={(e) => setBday(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="rounded-full border border-white/10 bg-background/60 px-3 py-1.5 text-sm text-foreground outline-none [color-scheme:dark] focus:border-primary/40"
            />
            <button
              onClick={calculate}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-fluid hover:shadow-[0_6px_24px_-6px_hsl(var(--primary)/0.7)] active:scale-[0.97]"
            >
              {lightYears > 0 ? "Update" : "See my Light"}
            </button>
          </div>
          {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
          <button
            onClick={onReadme}
            className="pointer-events-auto text-[10px] text-muted-foreground/70 underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
          >
            How this works — calculations &amp; assumptions
          </button>
        </div>

        {lightYears > 0 && (
          <button
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
            className="pointer-events-auto mt-0.5 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Your numbers ↓
          </button>
        )}
      </div>
    </section>
  );
};

/* --------------------------------- Stats -------------------------------- */
const Stats = ({ result, liveLy }: { result: Result; liveLy: number | null }) => {
  const { ref, className } = useReveal<HTMLDivElement>();
  const stats = [
    { label: "Your age", value: result.years.toFixed(1), unit: "years old" },
    {
      label: "Light traveled",
      value: result.lightYears.toFixed(1),
      unit: "light-years, at c",
    },
    {
      label: "Laps of the Sun",
      value: result.totalOrbits.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      unit: "your light, around Earth's orbit",
    },
  ];

  return (
    <div ref={ref} className={className}>
      <div className="glass-shell">
        <div className="glass-core p-6 sm:p-10">
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="reveal is-visible text-center sm:text-left"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="font-mono-num tnum text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.unit}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-7 sm:flex-row">
            <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground sm:text-left">
              Your light travels one light-year every year. If it instead looped
              Earth's orbit around the Sun (a ~52-minute lap), it would have gone
              around{" "}
              <span className="font-medium text-primary">
                {result.totalOrbits.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>{" "}
              times.
            </p>
            <div className="flex shrink-0 items-center gap-2.5 rounded-full glass px-4 py-2">
              <Radio className="h-4 w-4 animate-pulse text-beam" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground">live</span>
              <span className="font-mono-num tnum text-sm font-semibold text-beam">
                {(liveLy ?? result.lightYears).toFixed(7)} ly
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Reach panel ----------------------------- */
const ReachPanel = ({
  reachedStars,
  nextStar,
  result,
}: {
  reachedStars: typeof STARS;
  nextStar: (typeof STARS)[number] | undefined;
  result: Result;
}) => {
  const { ref, className } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${className} mt-6`} style={{ transitionDelay: "80ms" }}>
      <div className="glass-shell">
        <div className="glass-core p-6 sm:p-9">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Stars your light has reached
            </h2>
            <span className="font-mono-num tnum text-sm text-muted-foreground">
              {reachedStars.length}/{STARS.length}
            </span>
          </div>

          {reachedStars.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Still cruising inside the Solar System. The nearest star is light-years off.
            </p>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {reachedStars.map((s, i) => (
                <li key={s.name}>
                  <a
                    href={grokipediaUrl(s.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.desc}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-300 ease-fluid hover:border-primary/30 hover:bg-primary/5"
                    style={{ transitionDelay: `${Math.min(i, 8) * 30}ms` }}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      {s.name}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        strokeWidth={1.5}
                      />
                    </span>
                    <span className="font-mono-num tnum text-xs text-muted-foreground">
                      {s.distance} ly
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {nextStar && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-beam/15 bg-beam/[0.04] px-4 py-3">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-beam/80">
                Next
              </span>
              <p className="text-sm text-muted-foreground">
                <a
                  href={grokipediaUrl(nextStar.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {nextStar.name}
                </a>{" "}
                in{" "}
                <span className="font-mono-num tnum text-beam">
                  {(nextStar.distance - result.lightYears).toFixed(2)} ly
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
