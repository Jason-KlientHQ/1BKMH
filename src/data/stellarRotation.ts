/** Measured or literature rotation periods in days (photosphere / equatorial). */
export const MEASURED_ROTATION_DAYS: Record<string, number> = {
  Sun: 25.05,
  Sirius: 16.0,
  Vega: 0.52,
  "Proxima Centauri": 83.0,
  Betelgeuse: 3650,
  Antares: 1200,
  Regulus: 0.66,
  Arcturus: 120,
  Altair: 0.37,
  "Alpha Centauri A": 22,
  "Rigil Kentaurus": 22,
  Toliman: 22,
  Canopus: 3.6,
  Rigel: 1.5,
  Deneb: 365,
  Spica: 0.5,
  Pollux: 580,
  Capella: 8.5,
  Aldebaran: 520,
  Polaris: 119,
};

/** Pulsar spin periods in seconds (ATNF / catalog). */
export const PULSAR_PERIOD_SEC: Record<string, number> = {
  "Crab Pulsar": 0.033,
  "Vela Pulsar": 0.089,
};

/** Quasar accretion-disk visual period (days) — illustrative, not surface spin. */
export const QUASAR_DISK_PERIOD_DAYS = 2.5;

const SPECTRAL_DEFAULT_DAYS: [string, number][] = [
  ["O", 1.5],
  ["B", 2],
  ["A", 1],
  ["F", 3],
  ["G", 25],
  ["K", 35],
  ["M", 60],
];

function spectralLetter(spect: string): string {
  const m = spect.trim().match(/^([OBAFGKM])/i);
  return m ? m[1].toUpperCase() : "G";
}

/** Resolve rotation period in days for a named star or spectral type. */
export function rotationPeriodDays(name: string, spect?: string): { days: number; source: "measured" | "estimated" } {
  const measured = MEASURED_ROTATION_DAYS[name];
  if (measured != null) return { days: measured, source: "measured" };

  if (spect) {
    const letter = spectralLetter(spect);
    const row = SPECTRAL_DEFAULT_DAYS.find(([k]) => k === letter);
    if (row) return { days: row[1], source: "estimated" };
  }

  return { days: 25, source: "estimated" };
}