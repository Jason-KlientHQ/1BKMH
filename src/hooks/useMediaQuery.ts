import { useEffect, useState } from "react";

/**
 * Reactive matchMedia — updates on resize, orientation change, and display mode.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Tailwind `md` breakpoint — phones and small tablets in portrait. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}