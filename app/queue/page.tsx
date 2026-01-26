"use client";

import React, { useState } from "react";
import AvailableStations from "@/app/_components/AvailableStations";

export default function Page() {
  const mockStations = [
    { id: "s1", name: "Station Alpha" },
    { id: "s2", name: "Station Bravo" },
    { id: "s3", name: "Station Charlie" },
    { id: "s4", name: "Station Delta" },
    { id: "s5", name: "Station Echo" },
  ];

  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl p-6 border rounded-md">
        <h2 className="text-2xl font-semibold">Queue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Queue details and status will appear here. This page is the dedicated
          UI for viewing your queue entry.
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Available Stations</h3>
          <AvailableStations stations={mockStations} onPick={setSelected} />
          {selected && (
            <div className="mt-3 text-sm text-muted-foreground">
              Selected station: {selected.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
