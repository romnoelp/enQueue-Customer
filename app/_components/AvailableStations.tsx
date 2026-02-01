"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Station, StationWithEstimatedWait } from "@/types/station";

function formatWaitTime(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `~${hrs} hr`;
  return `~${hrs} hr ${mins} min`;
}

function hasEstimatedWait(s: Station): s is StationWithEstimatedWait {
  return typeof (s as StationWithEstimatedWait).estimatedWaitTime === "number";
}

export default function AvailableStations({
  stations,
  onPick,
}: {
  stations: Station[];
  onPick?: (s: Station) => void;
}) {
  const sorted = [...stations].sort((a, b) => {
    if (!hasEstimatedWait(a) || !hasEstimatedWait(b)) return 0;
    return a.estimatedWaitTime - b.estimatedWaitTime;
  });

  return (
    <div className="h-40 sm:h-48">
      <ScrollArea className="h-full">
        <div className="space-y-2 py-2">
          {sorted.map((s, i) => (
            <button
              key={s.id ?? s.name ?? i}
              type="button"
              onClick={() => onPick?.(s)}
              className="w-full text-left rounded-md border px-3 py-2.5 bg-muted text-muted-foreground text-sm hover:bg-accent/10 focus:outline-none flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 truncate">
                <span className="block truncate">{s.name}</span>
                {s.description && (
                  <span className="block text-xs text-muted-foreground truncate">{s.description}</span>
                )}
              </div>
              {hasEstimatedWait(s) && (
                <span className="text-xs font-medium text-foreground/80 shrink-0 tabular-nums">
                  Estimated wait time: {formatWaitTime(s.estimatedWaitTime)}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
