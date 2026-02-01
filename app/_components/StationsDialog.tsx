"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/animate-ui/components/radix/dialog";
import AvailableStations from "./AvailableStations";
import { Button } from "@/components/ui/button";
import type { Station } from "@/types/station";

export default function StationsDialog({
  open,
  setOpen,
  stations,
  onPick,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  stations: Station[];
  onPick?: (s: Station) => void;
}) {
  const handlePick = (s: Station) => {
    setOpen(false);
    onPick?.(s);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available Stations</DialogTitle>
          <DialogDescription>Click to pick a station</DialogDescription>
        </DialogHeader>

        <div className="px-0">
          <AvailableStations stations={stations} onPick={handlePick} />
        </div>

        <DialogFooter>
          <div className="w-full flex justify-end">
            <DialogClose asChild>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
