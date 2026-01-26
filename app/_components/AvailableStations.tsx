"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Station = { id: string; name: string };

export default function AvailableStations({
  stations,
  onPick,
}: {
  stations: Station[];
  onPick?: (s: Station) => void;
}) {
  return (
    <div className="h-40 sm:h-48">
      <ScrollArea className="h-full">
        <div className="space-y-2 py-2">
          {stations.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick?.(s)}
              className="w-full text-left rounded-md border px-3 py-2 bg-muted text-muted-foreground text-sm truncate hover:bg-accent/10 focus:outline-none">
              {s.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
