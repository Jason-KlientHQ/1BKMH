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

const SOURCE_LABEL: Record<"measured" | "estimated", string> = {
  measured: "measured",
  estimated: "estimated from spectral type",
};

/** Human-readable rotation period for detail panels (e.g. "25.1 d · measured"). */
export function formatRotationPeriod(days: number, source: "measured" | "estimated"): string {
  const prefix = source === "measured" ? "" : "~";
  const label = SOURCE_LABEL[source];

  if (days < 1 / 24) {
    const sec = days * 86_400;
    const value = sec < 10 ? sec.toFixed(2) : sec.toFixed(0);
    return `${prefix}${value} s · ${label}`;
  }
  if (days < 1) {
    const hrs = days * 24;
    return `${prefix}${hrs.toFixed(1)} h · ${label}`;
  }
  if (days >= 365) {
    const yrs = days / 365.25;
    const value = yrs >= 10 ? yrs.toFixed(0) : yrs.toFixed(1);
    return `${prefix}${value} yr · ${label}`;
  }
  const raw = days >= 100 ? days.toFixed(0) : days.toFixed(1);
  const value = raw.endsWith(".0") ? raw.slice(0, -2) : raw;
  return `${prefix}${value} d · ${label}`;
}

/** Pulsar / magnetar spin for detail panels. */
export function formatPulsarPeriod(sec: number): string {
  if (sec < 1) return `${(sec * 1000).toFixed(0)} ms · measured`;
  return `${sec.toFixed(2)} s · measured`;
}

/** Accretion-disk visual period for quasars (illustrative). */
export function formatQuasarDiskPeriod(days: number): string {
  return `~${days.toFixed(1)} d · illustrative disk spin`;
}