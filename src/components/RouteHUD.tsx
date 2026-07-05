import { Pause, Play, Square } from "lucide-react";
import { etaRemainingLabel, fuelRemainingKg, legAtProgress } from "@/mission/path";
import type { MissionResult } from "@/mission/types";

interface RouteHUDProps {
  destination: string;
  result: MissionResult;
  progress: number;
  flying: boolean;
  onProgressChange: (p: number) => void;
  onPlayPause: () => void;
  onStop: () => void;
}

export const RouteHUD = ({
  destination,
  result,
  progress,
  flying,
  onProgressChange,
  onPlayPause,
  onStop,
}: RouteHUDProps) => {
  const { leg, index } = legAtProgress(result, progress);
  const fuel = fuelRemainingKg(result, progress);
  const pct = Math.round(progress * 100);

  return (
    <div className="pointer-events-auto absolute bottom-20 left-4 z-20 w-[min(22rem,calc(100%-2rem))]">
      <div className="glass-shell">
        <div className="glass-core p-4 font-mono-num">
          <div className="flex items-center justify-between gap-2 border-b border-white/8 pb-2">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-beam/80">Navigation</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{destination}</p>
            </div>
            <span className="font-mono-num tnum rounded-full border border-beam/30 bg-beam/10 px-2.5 py-1 text-xs font-bold text-beam">
              {pct}%
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Leg</p>
              <p className="font-medium text-foreground">{index + 1}. {leg.label}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">ETA remaining</p>
              <p className="font-medium text-beam">{etaRemainingLabel(result, progress)}</p>
            </div>
            {result.cruiseSpeedKms != null && (
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Cruise</p>
                <p className="tnum text-foreground">{result.cruiseSpeedKms.toFixed(1)} km/s</p>
              </div>
            )}
            {fuel != null && (
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70">Propellant</p>
                <p className="tnum text-foreground">{(fuel / 1000).toFixed(2)} t</p>
              </div>
            )}
          </div>

          <p className="mt-2 text-[10px] leading-snug text-muted-foreground/80">{leg.detail}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onPlayPause}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-beam/30 bg-beam/10 text-beam transition-colors hover:bg-beam/20"
              title={flying ? "Pause flight" : "Play flight"}
            >
              {flying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition-colors hover:text-foreground"
              title="Stop and reset"
            >
              <Square className="h-3 w-3" fill="currentColor" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(e) => onProgressChange(parseFloat(e.target.value))}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-beam"
            />
          </div>
        </div>
      </div>
    </div>
  );
};