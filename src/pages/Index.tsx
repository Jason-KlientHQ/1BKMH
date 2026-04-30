import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { StarField } from "@/components/StarField";
import { OrbitVisual } from "@/components/OrbitVisual";

const LY_PER_YEAR = 0.00009935;

interface Result {
  years: number;
  lightYears: number;
  km: number;
}

const Index = () => {
  const [bday, setBday] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    if (!bday) {
      setError("Please pick your birthday first ✨");
      return;
    }
    const birth = new Date(bday);
    const now = new Date();
    if (birth > now) {
      setError("Your birthday must be in the past 🌌");
      return;
    }
    setError("");
    const ageMs = now.getTime() - birth.getTime();
    const years = ageMs / (365.25 * 24 * 60 * 60 * 1000);
    const lightYears = years * LY_PER_YEAR;
    const km = lightYears * 9.461e12;
    setResult({ years, lightYears, km });
  };

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
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </Card>

        {result && (
          <Card key={result.years} className="cosmic-card p-6 sm:p-10 animate-float-up">
            <div className="grid gap-6 sm:grid-cols-3">
              <Stat label="Your age" value={result.years.toFixed(2)} unit="years" />
              <Stat
                label="Light traveled"
                value={result.lightYears.toFixed(6)}
                unit="light years"
                highlight
              />
              <Stat
                label="That's about"
                value={result.km.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                unit="km"
              />
            </div>
            <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
              Light circling the Sun once per orbit since your birth has carried your
              wishes <span className="text-primary font-medium">{result.lightYears.toFixed(5)}</span> light
              years through the cosmos. 🌠
            </p>
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
