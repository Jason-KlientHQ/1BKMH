# Birthday Light Journey

An interactive cosmic visualization: enter your birthday and see how far a beam of light would have traveled since you were born — mapped across light-years and the nearest stars in a 3D galaxy.

Live at [1bkmh.com](https://1bkmh.com).

## The idea

Light travels one light-year per year. If a beam left the moment you were born and never stopped, it would already be deep among the stars. This app turns that distance into something you can explore: a growing sphere of light, real orbital mechanics in the solar system, and a catalog of named nearby stars you may have "reached."

## Features

- **Birthday → light-years** with optional leap-year accounting (365.25 vs 365 days)
- **Shareable URLs** — `?b=1990-06-15` and `&leap=0` when leap years are off
- **3D solar system** — planets, moons, dwarf planets, comets, spacecraft, belts, heliosphere, Oort cloud
- **Star neighborhood** — 30 hand-picked nearby stars plus ~350 from the HYG catalog
- **Live counter** — light-years tick up every second after you calculate
- **Interactive scene** — pause/speed, flythrough, timeline scrubber, PNG export, click-for-details
- **Technical README modal** — documents every calculation and assumption

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Three.js** / **React Three Fiber** / **Drei** for the 3D scene
- **Tailwind CSS** with a custom deep-space design system
- **Vitest** for unit tests
- **Cloudflare Workers** — static assets + www → apex redirect

## Development

```bash
npm install
npm run dev        # http://localhost:8080
npm test           # unit tests
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
  pages/Index.tsx          Main UI — hero, stats, star reach panel
  components/SolarSystem.tsx   3D scene (WebGL)
  components/TechnicalReadme.tsx   Calculation docs modal
  data/solarSystem.ts      Planets, moons, stars, spacecraft, etc.
  data/starCatalog.ts      HYG database stars (auto-generated)
  lib/constants.ts         Speed of light and derived constants
  lib/lightJourney.ts      Birthday → light-years calculations
  lib/orbital.ts           Keplerian mechanics + log-scale mapping
```

## Physics & assumptions

All light-based figures derive from a single constant:

```
c = 1,079,252,848.8 km/h  (= 299,792.458 km/s)
light-years = age in years  (1 Julian year = 1 ly)
```

Planet positions use real **J2000 Keplerian elements**. Distances and body sizes are **log-compressed** so moons and distant stars can share one zoomable scene — relative ordering is preserved, absolute scale is not.

See the in-app **"How this works"** modal or `src/components/TechnicalReadme.tsx` for the full breakdown.

## Tests

```bash
npm test
```

Covers:
- `computeLightJourney` — age, light-years, orbital laps, leap-year toggle
- URL param parsing and share-query building
- Star reach filtering
- Kepler solver, heliocentric positions, scale mapping

## License

Private project.