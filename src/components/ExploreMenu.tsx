import { createPortal } from "react-dom";
import { EXPLORE_GROUPS } from "@/data/exploreGroups";

export interface ExploreMenuProps {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
  onPick: (name: string) => void;
}

/**
 * Fixed portal overlay for the Explore destination picker.
 * Rendered on document.body so timeline HUD layers cannot block clicks.
 */
export function ExploreMenu({ open, isMobile, onClose, onPick }: ExploreMenuProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close explore menu"
        data-testid="explore-backdrop"
        className="fixed inset-0 z-[100] bg-black/45"
        onClick={onClose}
      />
      <div
        data-testid="explore-menu"
        role="dialog"
        aria-label="Explore destinations"
        className={`fixed z-[101] overflow-y-auto rounded-2xl glass p-2 text-left shadow-2xl ${
          isMobile
            ? "inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] max-h-[min(50dvh,360px)]"
            : "bottom-24 right-4 w-64 max-h-[min(60dvh,400px)]"
        }`}
      >
        <p className="px-2 py-1.5 text-[9px] uppercase tracking-wider text-muted-foreground/60">
          Explore destinations
        </p>
        {EXPLORE_GROUPS.map((g) => (
          <div key={g.label} className="mb-1 last:mb-0">
            <p className="px-2 py-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">{g.label}</p>
            {g.items.map((n) => (
              <button
                key={n}
                type="button"
                data-testid={`explore-item-${n.replace(/[^a-zA-Z0-9]+/g, "-")}`}
                onClick={() => {
                  onPick(n);
                  onClose();
                }}
                className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-foreground/90 transition-colors hover:bg-white/[0.06] hover:text-primary"
              >
                {n}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>,
    document.body,
  );
}