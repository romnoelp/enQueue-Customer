import type { Purpose } from "@/types/purpose";

export type Station = {
  id?: string; // Document ID (auto-generated)
  name: string; // Station name (e.g., "Tuition Payment")
  type: Purpose; // Purpose ID reference (deprecated, use purposes collection)
  description?: string; // Optional description
  createdAt?: string; // Creation timestamp (ISO string from API)
  updatedAt?: string; // Last update timestamp (ISO string from API)
};

export type StationWithEstimatedWait = Station & { estimatedWaitTime: number };