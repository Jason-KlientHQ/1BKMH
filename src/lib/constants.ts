// Speed of light — the single source of truth for every light-based calculation
// in the app. Expressed primarily in km/h, as requested; all other light
// constants are DERIVED from it so nothing drifts.
export const C_KMH = 1_079_252_848.8; // speed of light, km/h
export const C_KMS = C_KMH / 3600; // 299,792.458 km/s
export const C_KMS_ROUNDED = 299_792.458;

export const HOURS_PER_YEAR = 8766; // Julian year (365.25 × 24)
export const SEC_PER_YEAR = 31_557_600; // Julian year in seconds

export const AU_KM = 149_597_870.7; // 1 astronomical unit, km

// Distance light covers in one year (a light-year), from km/h × hours/year.
export const KM_PER_LY = C_KMH * HOURS_PER_YEAR; // ≈ 9.4607e12 km

// One-way light-travel time across 1 AU: distance ÷ speed.
export const SEC_PER_AU = AU_KM / C_KMS; // ≈ 499.0048 s

// Seconds of light travel in one light-year (== seconds per year, since a
// light-year is defined as c × 1 year).
export const SEC_PER_LY = SEC_PER_YEAR;

// Time for light to circle a ring at Earth's orbit (1 AU): circumference ÷ speed.
export const SECONDS_PER_ORBIT = (2 * Math.PI * AU_KM) / C_KMS; // ≈ 3135.29 s
