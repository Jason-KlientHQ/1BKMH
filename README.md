# Birthday Light Journey

An interactive cosmic visualization: enter your birthday and see how far a beam of light would have traveled since you were born — mapped across light-years and the nearest stars in a 3D galaxy.

Live at [1bkmh.com](https://1bkmh.com).

## The idea

Light travels one light-year per year. If a beam left the moment you were born and never stopped, it would already be deep among the stars. This app turns that distance into something you can explore: a growing sphere of light (a one-way travel metaphor), real orbital mechanics in the solar system, proper-motion star drift, and a catalog of named nearby stars you may have "reached."

## Features

### Light journey
- **Birthday → light-years** with optional leap-year accounting (365.25 vs 365 days)
- **Shareable URLs** — `?b=1990-06-15`, `&leap=0` when leap years are off
- **Live counter** — light-years tick up every second after you calculate
- **Timeline scrubber** — drag across your life to grow or shrink the light sphere

### 3D solar system
- Planets, moons, dwarf planets, comets, spacecraft (NASA glTF models + procedural fallbacks)
- Asteroid & Kuiper belts, heliosphere, schematic Local Bubble, Oort cloud
- Real **J2000 Keplerian** orbits with correct relative speeds
- **Educational mode** — true moon/exoplanet periods and accuracy badges (`?accuracy=edu`)
- **True orbits toggle** — cinematic vs real periods for moons and exoplanets (`?orbits=1`)
- **LEO spacecraft** — ISS and Hubble use play-time LEO phase (not birth-epoch spin)

### Stars & cosmos
- **~47 featured** bright/nearby stars (shader glow, curated stories) plus **~350** HYG catalog stars
- Famous giants: Betelgeuse, Antares, Rigel, Deneb, Orion's Belt, Canopus, Polaris, and more
- **Zoom-aware sizing** — distant stars stay readable on the map; catalog stars have magnitude-based floors
- **Proper motion** — star positions drift with simulation time and life-timeline scrub
- **Life stage & parallax** stats on star detail panels
- **Cosmic landmarks** — Andromeda, Magellanic Clouds, Galactic Center (compressed map placement)

### Star Navigator (mission planner)
- Trip estimates to any of **~380** stars via six propulsion modes:
  `gravity_assist`, `light_speed`, `sublight`, `nuclear`, `solar_sail`, `alcubierre`
- Cinematic flight HUD with leg-by-leg progress
- Mode comparison table
- Curved gravity-assist flyby paths around Jupiter and Saturn

### Interaction
- Pause/speed, flythrough, PNG export, click-for-details
- Explore menu (portal overlay) for spacecraft, bright stars, cosmic landmarks, black holes
- In-app **"How this works"** modal — full calculation docs
- **Mobile-friendly** layout — reactive breakpoints, safe-area insets, bottom-sheet navigator, adaptive WebGL quality tier

## Shareable URL parameters

| Param | Example | Meaning |
|-------|---------|---------|
| `b` | `?b=1990-06-15` | Birthday (ISO date) |
| `leap` | `&leap=0` | Disable leap-year accounting |
| `dest` | `&dest=Betelgeuse` | Mission destination star |
| `mode` | `&mode=nuclear` | Propulsion mode |
| `origin` | `&origin=earth` | Departure body (`sun` default) |
| `hull` | `&hull=falcon-freighter` | Mission craft hull preset (see `src/data/vesselPresets.ts`) |
| `mass`, `fuel`, `isp`, `thrust`, `sail`, `sublight`, `warp` | vessel tuning | See `src/mission/types.ts` |
| `fly` | `&fly=1` | Auto-start cinematic flight on load |
| `accuracy` | `&accuracy=edu` | Educational mode (true periods, accuracy badges) |
| `orbits` | `&orbits=1` | True moon/exoplanet orbital periods |

Example: `https://1bkmh.com/?b=2000-01-01&dest=Proxima%20Centauri&mode=sublight&fly=1&accuracy=edu&orbits=1`

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Three.js** / **React Three Fiber** / **Drei** for the 3D scene
- **Tailwind CSS** with a custom deep-space design system
- **Vitest** (97 unit tests) + **Playwright** (2 e2e tests)
- **Cloudflare Workers** — static assets + www → apex redirect
- **Code-split bundles** — lazy `scene`, `mission-ui`, `readme`, `three`, `r3f` chunks (~14 KB gzip main entry)

## Development

```bash
npm install
npm run dev        # http://localhost:8080
npm test           # Vitest unit tests
npm run test:e2e   # Playwright (starts dev server)
npm run lint       # ESLint
npm run build      # production build → dist/
```

## Deployment

The app deploys to Cloudflare Workers with static assets from `./dist`.

```bash
npm run build
npx wrangler deploy
```

Configuration lives in `wrangler.jsonc` and `worker.js`:
- Custom domains: `1bkmh.com`, `www.1bkmh.com` (301 redirect to apex)
- SPA fallback for client-side routing

## Project structure

```
src/
  pages/Index.tsx              Hero, stats, lazy-loaded 3D viewport + mission UI
  components/
    SolarSystem.tsx            3D scene (WebGL)
    ExploreMenu.tsx            Destination picker (portal overlay)
    MissionPlanner.tsx         Star Navigator panel
    RouteHUD.tsx               Cinematic flight progress
    TechnicalReadme.tsx        Calculation docs modal
    GltfModel.tsx              NASA glTF loader + fallbacks
  mission/                     Planner, paths, propulsion, URL sync
  stellar/                     Mass, life stage, render sizing
  astrometry/                  Star positions, proper motion
  propulsion/                  Trip physics per drive mode
  data/
    solarSystem.ts             Planets, stars, landmarks, spacecraft
    exploreGroups.ts           Explore menu groupings
    starCatalog.ts             HYG database (auto-generated)
    properMotion.ts            Gaia/Hipparcos PM by star name
    nasaModels.ts              glTF model paths
  lib/
    constants.ts               Speed of light and derived constants
    lightJourney.ts            Birthday → light-years
    orbital.ts                 Keplerian mechanics + log-scale mapping
    stellarDisplay.ts          Zoom-aware star display sizing
    accuracyMode.ts            Cinematic vs educational presets
    simEpoch.ts                Birth-tied orbital epoch
    earthOrbit.ts              LEO spacecraft positioning
  hooks/
    useMediaQuery.ts           Reactive mobile breakpoint
    useSceneQuality.ts         Adaptive WebGL quality tier
e2e/
  explore-hud.spec.ts          Explore menu + URL restore regression
public/
  models/nasa/                 Vendored NASA glTF assets (~12 MB)
```

## Physics & assumptions

All light-based figures derive from a single constant:

```
c = 1,079,252,848.8 km/h  (= 299,792.458 km/s)
light-years = age in years  (1 Julian year = 1 ly)
```

Planet positions use real **J2000 Keplerian elements**. Distances and body sizes are **log-compressed** so moons and distant stars can share one zoomable scene — relative ordering is preserved, absolute scale is not.

The expanding light sphere is a **metaphor** for one-way travel since your birthday — not a physical shockwave. Cosmic expansion, general relativity, and aberration are not simulated.

See the in-app **"How this works"** modal or `src/components/TechnicalReadme.tsx` for the full breakdown.

## Tests

```bash
npm test           # 97 Vitest unit tests
npm run test:e2e   # Playwright HUD regression (explore menu, URL orbits)
```

Covers light journey math, URL parsing, Kepler solver, scale mapping, stellar physics, proper motion, mission paths, propulsion modes, featured stars, cosmic landmarks, scene quality, and explore HUD behavior.

## Assets

NASA 3D Resources models in `public/models/nasa/` (~12 MB total). Credits in `public/models/nasa/CREDITS.txt`.

## Known limitations

- Distances and body sizes are log-compressed for one zoomable scene — not true scale.
- Star positions use catalog directions + proper motion; not a full ephemeris integrator.
- Mission gravity assists use patched conics — good for wonder, not JPL-grade.
- Asteroid/Kuiper belts rotate as groups, not individual rock orbits.
- Speculative drives (Alcubierre, sublight) are labeled as hypothetical.

## Acknowledgments

- **[xAI Grok](https://x.ai)** — architecture, physics modules, mission planner, NASA model integration, mobile polish, and ongoing development assistance.
- **Star data** — HYG catalog (Hipparcos · Yale · Gliese); proper motion from Gaia DR3 / Hipparcos where available.
- **Orbital elements** — J2000 ephemeris conventions (JPL).
- **3D spacecraft models** — [NASA 3D Resources](https://nasa3d.arc.nasa.gov/models) (Hubble, JWST, ISS, Voyager, Saturn).
- **Body facts** — [Grokipedia](https://grokipedia.com) and NASA Science.

## License

Private project. Issues and contributions via [GitHub](https://github.com/Jason-KlientHQ/birthday-light-journey).