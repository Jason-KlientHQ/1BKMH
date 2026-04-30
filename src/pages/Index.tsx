import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Rocket, Telescope, Play, Download, ExternalLink, Activity } from "lucide-react";
import { StarField } from "@/components/StarField";
import { OrbitVisual } from "@/components/OrbitVisual";
import { GalaxyMap, STARS, type GalaxyMapHandle } from "@/components/GalaxyMap";

const SECONDS_PER_ORBIT = 3135;

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
  const [showMap, setShowMap] = useState(false);
  const [liveLy, setLiveLy] = useState<number | null>(null);
  const mapRef = useRef<GalaxyMapHandle>(null);

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
      setError("Please pick your birthday first ✨");
      return;
    }
    const r = compute(bday, useLeap);
    if (!r) {
      setError("Your birthday must be in the past 🌌");
      return;
    }
    setError("");
    setResult(r);
    setShowMap(false);
  };

  // Live ticker — updates every second once a result exists
  useEffect(() => {
    if (!result) return;
    const id = setInterval(() => {
      const r = compute(bday, useLeap);
      if (r) setLiveLy(r.lightYears);
    }, 1000);
    return () => clearInterval(id);
  }, [result, bday, useLeap]);

  const reachedStars = result ? STARS.filter((s) => s.distance <= result.lightYears) : [];
  const nextStar = result
    ? STARS.find((s) => s.distance > result.lightYears)
    : undefined;

  return (
    <main className="relative min-h-screen px-4 py-12 sm:py-20">
      <StarField />

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-12 text-center animate-float-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            A cosmic birthday gift
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">Your Birthday</span>
            <br />
            Light Journey
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            If a beam of light circled the Sun once every birthday since you were born,
            how far would it have traveled? Let's find out.
          </p>
        </header>

        <Card className="cosmic-card mb-8 p-6 sm:p-10 animate-float-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <OrbitVisual />

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bday" className="text-base">
                When were you born?
              </Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="bday"
                  type="date"
                  value={bday}
                  onChange={(e) => setBday(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-12 flex-1 text-base"
                />
                <Button onClick={calculate} size="lg" className="h-12 font-semibold">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Calculate
                </Button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="leap"
                  checked={useLeap}
                  onCheckedChange={(v) => setUseLeap(v === true)}
                />
                <Label htmlFor="leap" className="text-sm text-muted-foreground cursor-pointer">
                  Use leap years (365.25 days)
                </Label>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </Card>

        {result && (
          <Card key={result.years} className="cosmic-card p-6 sm:p-10 animate-float-up">
            <div className="grid gap-6 sm:grid-cols-3">
              <Stat label="Your age" value={result.years.toFixed(1)} unit="years" />
              <Stat
                label="Orbits per birthday"
                value={Math.round(result.orbitsPerYear).toLocaleString("en-US")}
                unit="orbits/year"
              />
              <Stat
                label="Total orbits"
                value={result.totalOrbits.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                unit="around the Sun"
              />
            </div>
            <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
              Light has traveled a total distance of{" "}
              <span className="text-primary font-medium">{result.lightYears.toFixed(1)}</span>{" "}
              light-years since you were born. 🌠
            </p>

            {/* Live ticker */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-accent/10 px-4 py-2 text-sm">
              <Activity className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-muted-foreground">Live distance:</span>
              <span className="font-mono font-bold text-accent">
                {(liveLy ?? result.lightYears).toFixed(7)} ly
              </span>
            </div>

            {/* Stars reached */}
            <div className="mt-8 rounded-lg border border-border bg-background/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Stars your light has reached
                </h3>
              </div>
              {reachedStars.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Still cruising inside the Solar System ☀️
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {reachedStars.map((s) => (
                    <li key={s.name}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.desc}
                        className="group flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-sm transition-colors hover:bg-primary/20"
                      >
                        <span className="flex items-center gap-1.5 font-medium text-primary">
                          {s.name}
                          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                        <span className="text-xs text-muted-foreground">{s.distance} ly</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {nextStar && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Next stop:{" "}
                  <a
                    href={nextStar.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline-offset-2 hover:underline"
                  >
                    {nextStar.name}
                  </a>{" "}
                  in{" "}
                  <span className="text-accent">
                    {(nextStar.distance - result.lightYears).toFixed(2)} ly
                  </span>
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" size="lg" onClick={() => setShowMap((v) => !v)}>
                <Telescope className="mr-2 h-4 w-4" />
                {showMap ? "Hide" : "Show"} 3D Galaxy Map
              </Button>
              {showMap && (
                <>
                  <Button
                    size="lg"
                    onClick={() => mapRef.current?.animate()}
                    className="bg-[hsl(28_100%_52%)] text-white hover:bg-[hsl(28_100%_46%)]"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Animate Light Sphere
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => mapRef.current?.exportPNG()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export PNG
                  </Button>
                </>
              )}
            </div>

            {showMap && (
              <div className="mt-6 animate-float-up">
                <GalaxyMap ref={mapRef} lightYears={result.lightYears} />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Drag to rotate · scroll to zoom · click star labels to learn more
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
};

const Stat = ({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) => (
  <div className="text-center">
    <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p
      className={`text-3xl font-bold sm:text-4xl ${
        highlight ? "text-gradient" : "text-foreground"
      }`}
    >
      {value}
    </p>
    <p className="mt-1 text-sm text-muted-foreground">{unit}</p>
  </div>
);

export default Index;
