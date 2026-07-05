/** Physical properties used for rendering and mission planning. */
export interface StellarPhysical {
  name: string;
  distanceLy: number;
  radiusSolar: number;
  massSolar: number;
  luminositySolar: number;
  spectral: string;
  color: string;
  /** Unit direction in scene coordinates (heliocentric). */
  unitDir: [number, number, number];
}