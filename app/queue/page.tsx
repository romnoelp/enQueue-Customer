"use client";

import React, { useState } from "react";
import AvailableStations from "@/app/_components/AvailableStations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="min-h-screen bg-transparent p-6 sm:p-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Queue</CardTitle>
            <CardDescription>
              Queue details and status will appear here. This page is the
              dedicated UI for viewing your queue entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div>
              <h3 className="mb-2 text-base font-medium">Available Stations</h3>
              <AvailableStations stations={mockStations} onPick={setSelected} />
              {selected && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Selected station: {selected.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
