import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { StarField } from "@/components/StarField";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 — route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 text-center">
      <StarField />
      <div className="grain-overlay" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="animate-aurora absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(42_90%_50%/0.14),transparent_65%)] blur-2xl" />
      </div>

      <div className="relative z-10 animate-float-up">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.3em] text-beam/80">
          Lost in the dark
        </p>
        <h1 className="font-display text-[clamp(4rem,18vw,9rem)] font-bold leading-none tracking-tight text-gradient">
          404
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-pretty text-muted-foreground">
          This page drifted past the edge of the map. Even light hasn't reached it yet.
        </p>
        <a
          href="/"
          className="group mt-8 inline-flex items-center gap-3 rounded-full bg-primary py-3 pl-6 pr-2.5 font-semibold text-primary-foreground transition-all duration-500 ease-fluid hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.7)] active:scale-[0.98]"
        >
          Back to the start
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </a>
      </div>
    </main>
  );
};

export default NotFound;
