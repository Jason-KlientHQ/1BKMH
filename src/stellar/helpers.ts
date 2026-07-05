import type { CatalogStar } from "@/data/starCatalog";
import type { StarPOI } from "@/data/solarSystem";
import { estimateLuminositySolar, resolveMassSolar } from "@/stellar/physics";
import { stellarGlowOpacity, stellarRenderRadius } from "@/stellar/render";

export interface StarRenderProps {
  massSolar: number;
  luminositySolar: number;
  size: number;
  glow: number;
}

export function featuredStarRender(star: StarPOI): StarRenderProps {
  const massSolar = resolveMassSolar(star.name, star.radiusSolar, star.spectral);
  const luminositySolar = estimateLuminositySolar(star.radiusSolar, massSolar, star.spectral);
  return {
    massSolar,
    luminositySolar,
    size: stellarRenderRadius({ radiusSolar: star.radiusSolar, massSolar, luminositySolar }),
    glow: stellarGlowOpacity(luminositySolar, star.lum),
  };
}

export function catalogStarRender(star: CatalogStar): StarRenderProps {
  const massSolar = resolveMassSolar(star.name, star.r, star.spect);
  const luminositySolar = estimateLuminositySolar(star.r, massSolar, star.spect);
  return {
    massSolar,
    luminositySolar,
    size: stellarRenderRadius({
      radiusSolar: star.r,
      massSolar,
      luminositySolar,
      apparentMag: star.mag,
    }),
    glow: stellarGlowOpacity(luminositySolar),
  };
}