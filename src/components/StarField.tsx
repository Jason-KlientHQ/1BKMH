import { useMemo } from "react";

/**
 * Layered starfield. Three depth bands give parallax-like richness without a
 * scroll listener: tiny faint dust, mid stars, and a few bright glow stars.
 * Fixed + pointer-events-none so it never interferes with the UI.
 */
export const StarField = () => {
  const stars = useMemo(() => {
    const rng = (min: number, max: number) => Math.random() * (max - min) + min;
    return Array.from({ length: 220 }, (_, i) => {
      const band = Math.random();
      const bright = band > 0.92;
      const mid = !bright && band > 0.6;
      const size = bright ? rng(2.2, 3.4) : mid ? rng(1.3, 2) : rng(0.6, 1.2);
      return {
        id: i,
        top: rng(0, 100),
        left: rng(0, 100),
        size,
        bright,
        opacity: bright ? rng(0.85, 1) : mid ? rng(0.5, 0.8) : rng(0.18, 0.4),
        delay: rng(0, 4),
        duration: rng(2.4, 5),
      };
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-[hsl(var(--star))] animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.bright
              ? "0 0 6px hsl(var(--star) / 0.9), 0 0 12px hsl(42 100% 70% / 0.5)"
              : undefined,
          }}
        />
      ))}
    </div>
  );
};
