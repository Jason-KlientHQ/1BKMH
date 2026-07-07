import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

describe("useMediaQuery", () => {
  let listeners: Array<() => void> = [];
  let matches = false;

  beforeEach(() => {
    listeners = [];
    matches = false;
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when media does not match", () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);
  });

  it("updates when the media query changes", () => {
    matches = false;
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach((l) => l());
    });

    expect(result.current).toBe(true);
  });
});