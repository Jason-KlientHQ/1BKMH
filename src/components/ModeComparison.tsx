import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { compareModes } from "@/mission/compare";
import type { NavStar } from "@/mission/stars";
import type { MissionOrigin, PropulsionMode, VesselConfig } from "@/mission/types";

interface ModeComparisonProps {
  dest: NavStar;
  vessel: VesselConfig;
  origin: MissionOrigin;
  activeMode: PropulsionMode;
  onSelectMode: (mode: PropulsionMode) => void;
}

export const ModeComparison = ({
  dest,
  vessel,
  origin,
  activeMode,
  onSelectMode,
}: ModeComparisonProps) => {
  const [open, setOpen] = useState(false);
  const rows = useMemo(
    () => compareModes(dest, vessel, origin, activeMode),
    [dest, vessel, origin, activeMode],
  );
  const fastest = rows[0];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Compare propulsion
          </p>
          <p className="mt-0.5 text-[11px] text-foreground/90">
            Fastest: <span className="font-medium text-beam">{fastest.label}</span> · {fastest.etaLabel}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/8 px-1 pb-1">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-[9px] uppercase tracking-wider text-muted-foreground/70">
                <th className="px-2 py-1.5 text-left font-medium">Mode</th>
                <th className="px-2 py-1.5 text-right font-medium">ETA</th>
                <th className="px-2 py-1.5 text-right font-medium">Cruise</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.mode}>
                  <td colSpan={3} className="p-0">
                    <button
                      type="button"
                      onClick={() => onSelectMode(row.mode)}
                      className={`flex w-full items-center gap-2 px-2 py-1.5 transition-colors hover:bg-white/[0.04] ${
                        row.isActive ? "bg-beam/[0.08]" : ""
                      }`}
                    >
                      <span className={`min-w-0 flex-1 text-left font-medium ${row.isActive ? "text-beam" : "text-foreground/90"}`}>
                        {row.label}
                        {row.speculative && (
                          <span className="ml-1 text-[8px] font-semibold uppercase tracking-wider text-amber-300/80">
                            hyp
                          </span>
                        )}
                        {!row.feasible && (
                          <span className="ml-1 text-[8px] font-semibold uppercase tracking-wider text-destructive/80">
                            !
                          </span>
                        )}
                      </span>
                      <span className="font-mono-num tnum shrink-0 text-muted-foreground">{row.etaLabel}</span>
                      <span className="font-mono-num tnum w-14 shrink-0 text-right text-muted-foreground/80">
                        {row.cruiseSpeedKms != null
                          ? `${row.cruiseSpeedKms >= 1000 ? (row.cruiseSpeedKms / 1000).toFixed(0) + "k" : row.cruiseSpeedKms.toFixed(0)} km/s`
                          : "—"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};