import { useEffect, useRef, useState } from "react";

const SRC = "/ambient.mp3";
const LEVEL = 0.55;

/**
 * Loops the instrumental space track as ambient sound. Browsers block autoplay
 * until a user gesture, so playback begins on the first pointer/key event and is
 * unmuted by default. Returns { muted, toggle } for a mute control.
 */
export function useAmbient() {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  const fadeTo = (target: number) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) window.clearInterval(fadeRef.current);
    const step = (target - a.volume) / 24;
    fadeRef.current = window.setInterval(() => {
      const next = a.volume + step;
      if ((step > 0 && next >= target) || (step < 0 && next <= target) || Math.abs(step) < 1e-4) {
        a.volume = Math.min(1, Math.max(0, target));
        if (fadeRef.current) window.clearInterval(fadeRef.current);
      } else {
        a.volume = Math.min(1, Math.max(0, next));
      }
    }, 60);
  };

  const start = () => {
    if (!audioRef.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = "auto";
      a.volume = 0;
      audioRef.current = a;
    }
    const a = audioRef.current;
    a.play().then(() => fadeTo(muted ? 0 : LEVEL)).catch(() => {});
  };

  // Start on the first user gesture (autoplay policy). Cover every gesture type.
  useEffect(() => {
    let done = false;
    const onGesture = () => {
      if (done) return;
      done = true;
      start();
      ["pointerdown", "keydown", "click", "touchstart"].forEach((ev) => window.removeEventListener(ev, onGesture));
    };
    ["pointerdown", "keydown", "click", "touchstart"].forEach((ev) => window.addEventListener(ev, onGesture));
    return () => ["pointerdown", "keydown", "click", "touchstart"].forEach((ev) => window.removeEventListener(ev, onGesture));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (fadeRef.current) window.clearInterval(fadeRef.current);
      audioRef.current?.pause();
    },
    []
  );

  const toggle = () => {
    start();
    setMuted((m) => {
      const nm = !m;
      fadeTo(nm ? 0 : LEVEL);
      return nm;
    });
  };

  return { muted, toggle };
}
