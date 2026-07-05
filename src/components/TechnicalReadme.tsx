import type { ReactNode } from "react";
import { X } from "lucide-react";

/**
 * A README-style modal explaining every calculation, the orbital mechanics, the
 * scale mapping, and the assumptions — written like technical docs an engineer
 * would read.
 */
export const TechnicalReadme = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#04050c]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-shell max-h-[86vh] w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-core flex max-h-[86vh] flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2 font-mono text-sm text-foreground">
              <span className="text-primary">$</span> README.md — how the light journey is computed
            </div>
            <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground" title="Close">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-5 font-mono text-[12.5px] leading-relaxed text-muted-foreground">
            <Section title="## The core idea">
              A beam of light leaves the moment you're born and never stops. In{" "}
              <C>N</C> years of life it travels <C>N</C> light-years — because light,
              by definition, covers one light-year per year. This app makes that
              distance tangible: which real stars has your light already passed?
            </Section>

            <Section title="## The speed of light (source of truth)">
              Every light-based figure derives from one constant:
              <Code>{`c = 1,079,252,848.8 km/h   (= 299,792.458 km/s)
1 light-year = c × 8,766 h = 9.4607e12 km   // hours in a Julian year
1 AU light-time = 149,597,870.7 km ÷ c = 499.00 s`}</Code>
            </Section>

            <Section title="## The light calculation">
              <Code>{`ageSeconds  = now - birthDate            // exact, to the second
lightYears  = ageSeconds / secondsPerYear
distance_km = lightYears × (c × 8,766 h) // lightYears × 9.4607e12 km`}</Code>
              A body at distance <C>D</C> light-years is "reached" once{" "}
              <C>lightYears ≥ D</C>. Arrival date = <C>birthDate + D years</C> (for
              stars) or <C>birthDate + D_AU × 499s</C> (for solar-system bodies,
              where light crosses 1 AU in 499 seconds at{" "}
              <C>1,079,252,848.8 km/h</C>).
            </Section>

            <Section title="## Orbits around the Sun">
              The "orbits" figure reframes that same path length as loops of Earth's
              orbit. One lap of a circle at 1 AU has circumference{" "}
              <C>2π × 1 AU ≈ 9.4×10⁸ km</C>, which light crosses in:
              <Code>{`SECONDS_PER_ORBIT = 2π × 1 AU / c
                  = 939,951,143 km ÷ (1,079,252,848.8 km/h ÷ 3600)
                  ≈ 3,135.3 s  (~52.3 minutes)
totalOrbits = ageSeconds / 3,135.3`}</Code>
            </Section>

            <Section title="## Orbital mechanics (the planets & comets)">
              Planet and comet positions come from real <C>J2000</C> Keplerian
              elements (a, e, i, Ω, ϖ, L₀, period). Each frame we solve Kepler's
              equation for the eccentric anomaly by Newton iteration:
              <Code>{`M = L0 + (360/period)·t − ϖ        // mean anomaly
E − e·sin E = M                     // solved iteratively for E
(x,y) in orbital plane, then rotated by ϖ, i, Ω → ecliptic`}</Code>
              Relative orbital speeds are therefore physically correct (Kepler's 3rd
              law): inner planets really do move faster than outer ones.
            </Section>

            <Section title="## The scale (why it's log-piecewise)">
              True scale is unviewable — the Sun-to-Neptune span and the Sun-to-star
              span differ by ~10,000×. So distance → scene units is piecewise:
              <Code>{`inside heliosphere (≤130 AU): logarithmic  (moons stay explorable)
beyond it:                    linear in light-years (stars stay proportional)`}</Code>
              Body sizes are exaggerated (log / cube-root compressed) so a moon and a
              giant star can share one scene. Sizes and distances keep correct
              relative ORDER; absolute proportions are compressed on purpose.
            </Section>

            <Section title="## Star Navigator & propulsion (mission planner)">
              The navigator estimates trip time from the Sun (or Earth) to any of ~380 catalog
              stars. Each mode uses a different physics model — wonder over precision for
              speculative drives:
              <Code>{`light_speed     → 1 ly per year at c (physical upper bound)
sublight        → constant fraction of c (hypothetical, no accel model)
alcubierre      → effective speed = c × warp factor (speculative)
nuclear         → Tsiolkovsky: Δv = Isp·g₀·ln(m₀/m₁), then ballistic coast
solar_sail      → F = 2P/c × area at 1 AU, numerical integration to target
gravity_assist  → Jupiter (+9.2 km/s) + Saturn (+4.8 km/s) flybys,
                  plus 60% of onboard fuel for a departure burn`}</Code>
              The cinematic flight visualiser maps mission legs to 3D waypoints along a
              piecewise path; gravity-assist legs snap to planet positions at the current
              sim clock. ETA remaining in the HUD scales with mission ETA × trip progress
              (0–100%). Share links encode <C>dest</C>, <C>mode</C>, vessel params, and{" "}
              <C>fly=1</C> to auto-start the route animation on load.
            </Section>

            <Section title="## Assumptions & simplifications">
              <ul className="ml-4 list-disc space-y-1">
                <li>Moon cadence is slowed to a calm, watchable rate (wonder over exact periods).</li>
                <li>Belts rotate as a group rather than each rock on its own orbit.</li>
                <li>Star & body sizes are exaggerated for visibility; distances are compressed.</li>
                <li>Light travels in a straight line at c; gravity/relativity are ignored for the birthday beam.</li>
                <li>Mission routes are straight-line heliocentric estimates — no full n-body astrodynamics.</li>
                <li>Leap years optional (365.25 vs 365 days/yr toggle).</li>
              </ul>
            </Section>

            <Section title="## Data sources">
              <ul className="ml-4 list-disc space-y-1">
                <li>Planet/comet elements: J2000 mean orbital elements (JPL).</li>
                <li>Nearest stars & catalog (~350): the HYG database (Hipparcos·Yale·Gliese) — real positions, distances, spectral types, colours.</li>
                <li>Body facts & "read more": Grokipedia, then NASA.</li>
              </ul>
            </Section>

            <p className="mt-5 border-t border-white/10 pt-4 text-[11px] text-muted-foreground/60">
              Built for wonder, grounded in real numbers. Distances and dates are
              accurate to the physics above; the visuals are honestly compressed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-5">
    <h3 className="mb-1.5 font-mono text-[13px] font-semibold text-primary">{title}</h3>
    <div className="text-muted-foreground">{children}</div>
  </div>
);

const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[11.5px] text-foreground">{children}</code>
);

const Code = ({ children }: { children: string }) => (
  <pre className="my-2 overflow-x-auto rounded-lg border border-white/5 bg-black/30 p-3 text-[11.5px] text-foreground/90">
    {children}
  </pre>
);
