import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal via IntersectionObserver (never a scroll listener — that
 * thrashes layout on mobile). Returns a ref + a className you spread onto the
 * element. Pair with the `.reveal` / `.is-visible` rules in index.css.
 *
 *   const { ref, className } = useReveal();
 *   <div ref={ref} className={className} style={{ transitionDelay: "120ms" }}>
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, visible, className: `reveal${visible ? " is-visible" : ""}` };
}
