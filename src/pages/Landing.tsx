import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Github, Telescope, Users } from "lucide-react";
import { StarField } from "@/components/StarField";

const GITHUB_URL = "https://github.com/Jason-KlientHQ/birthday-light-journey";

const TechnicalReadme = lazy(() =>
  import("@/components/TechnicalReadme").then((m) => ({ default: m.TechnicalReadme })),
);

const Landing = () => {
  const [readmeOpen, setReadmeOpen] = useState(false);

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden">
      <StarField />
      <div className="grain-overlay" />

      <Suspense fallback={null}>
        <TechnicalReadme open={readmeOpen} onClose={() => setReadmeOpen(false)} />
      </Suspense>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="animate-aurora absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(42_90%_50%/0.16),transparent_65%)] blur-2xl" />
        <div className="animate-aurora absolute bottom-[-12rem] right-[-8rem] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,hsl(180_80%_45%/0.12),transparent_65%)] blur-2xl [animation-delay:-7s]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-[max(2rem,env(safe-area-inset-top))] pb-24">
        <header className="mb-14 text-center">
          <h1
            className="animate-float-up font-display text-[clamp(2.5rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-balance"
            style={{ opacity: 0 }}
          >
            How far has your
            <br />
            <span className="text-gradient">light traveled?</span>
          </h1>

          <p
            className="animate-float-up mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg [animation-delay:0.1s]"
            style={{ opacity: 0 }}
          >
            Light moves one light-year per year. If a beam left the moment you were born and never
            stopped, it would already be deep among the stars. This app turns that distance into
            something you can fly through — a growing sphere of light, real orbits, and a map of the
            neighborhood around the Sun.
          </p>

          <Link
            to="/explore"
            className="animate-float-up group mt-10 inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-primary py-3 pl-6 pr-3 font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.6)] transition-all duration-500 ease-fluid hover:shadow-[0_10px_40px_-6px_hsl(var(--primary)/0.75)] active:scale-[0.98] [animation-delay:0.18s]"
            style={{ opacity: 0 }}
          >
            Explore
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-500 ease-fluid group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </header>

        <section className="animate-float-up glass-shell [animation-delay:0.24s]" style={{ opacity: 0 }}>
          <div className="glass-core space-y-8 p-6 sm:p-9">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Why this exists
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Space is vast enough to break your intuition — and beautiful enough to pull you back
                in. Birthday Light Journey is built to spark curiosity: to make you wonder what your
                personal light-year radius actually means, which stars you have already
                &ldquo;reached,&rdquo; and what it would take to visit them for real.
              </p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground">
                <Telescope className="h-4 w-4 text-beam" strokeWidth={1.5} />
                How to explore
              </h2>
              <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">1.</span> Enter your birthday — your
                  age becomes light-years traveled.
                </li>
                <li>
                  <span className="font-medium text-foreground">2.</span> Watch the light sphere
                  expand and scrub through your life on the timeline.
                </li>
                <li>
                  <span className="font-medium text-foreground">3.</span> Click any world or star
                  for details, then open the Star Navigator to plot a trip.
                </li>
                <li>
                  <span className="font-medium text-foreground">4.</span> Share a link — every view
                  is restorable from the URL.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-beam/20 bg-beam/[0.05] p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground">
                <Users className="h-4 w-4 text-beam" strokeWidth={1.5} />
                Space fans, we need you
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This is an open sky, not a finished product. If you love astronomy, sci-fi
                navigation, or teaching — help us make it better. Spot a wrong distance? Know a star
                story we should tell? Have a model, fact-check, or UX idea? Open an issue, send a
                pull request, or drop a note about what would make you share this with a friend.
              </p>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-beam transition-colors hover:text-beam/80"
              >
                <Github className="h-4 w-4" strokeWidth={1.5} />
                Contribute on GitHub
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground/60">
          <p>Distances and stars are approximate — wonder over precision.</p>
          <button
            onClick={() => setReadmeOpen(true)}
            className="mt-3 text-muted-foreground/80 underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
          >
            How this works — calculations &amp; assumptions
          </button>
        </footer>
      </div>
    </main>
  );
};

export default Landing;