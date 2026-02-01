"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import StationsDialog from "../_components/StationsDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";

import type { Purpose } from "@/types/purpose";
import type { Station, StationWithEstimatedWait } from "@/types/station";

function getSessionIdFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/sessionId=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setSessionIdInCookie(sessionId: string): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `sessionId=${encodeURIComponent(sessionId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [purpose, setPurpose] = useState<Purpose | "">("");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Station | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (purpose === "") return;
    setError(null);
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;

    try {
      const sessionId = getSessionIdFromCookies();
      const response = await axios.get<StationWithEstimatedWait[] | { stations: Station[] }>(
        `${baseUrl}/queues/available-stations`,
        {
          params: {
            purpose,
            qrId: sessionId
          },
        }
      );
      const data = Array.isArray(response.data)
        ? response.data
        : (response.data?.stations ?? []);
      setStations(data);
      setOpen(true);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Failed to load stations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (s: Station) => {
    setSelected(s);
    setJoinError(null);
    setJoinLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
    const qrId = getSessionIdFromCookies();

    if (!s.id || !qrId) {
      setJoinError(!qrId ? "Session not found. Please scan the QR code again." : "Station ID is missing.");
      setJoinLoading(false);
      return;
    }

    try {
      const response = await axios.post<{ sessionId?: string }>(
        `${baseUrl}/queues/join`,
        {
          email: email.trim(),
          purpose,
          qrId,
          stationId: s.id,
        }
      );
      const sessionId = response.data?.sessionId;
      if (sessionId) {
        setSessionIdInCookie(sessionId);
      }
      router.push("/queue");
    } catch (err) {
      setJoinError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Failed to join queue"
      );
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Provide your NEU email and purpose
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email-local">Email</Label>
                <div className="mt-1 flex items-center">
                  <Input
                    id="email-local"
                    className="flex-1 min-w-0"
                    placeholder="romnoel.petracorta"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>Purpose</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {purpose === "" ? "Select purpose" : purpose}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Purpose</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={purpose}
                      onValueChange={(v) => setPurpose(v as Purpose)}>
                      <DropdownMenuRadioItem value="payment">
                        Payment
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="registrar">
                        Registrar
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="clinic">
                        Clinic
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="auditing">
                        Auditing
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full flex flex-col gap-2">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={
                    email.trim() === "" ||
                    purpose === "" ||
                    loading
                  }>
                  {loading ? "Loading..." : "Submit"}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <StationsDialog
          open={open}
          setOpen={setOpen}
          stations={stations}
          onPick={handlePick}
        />

        {selected && (
          <div className="max-w-md mx-auto mt-3 space-y-1 text-sm text-muted-foreground">
            <p>Selected station: {selected.name}</p>
            {joinLoading && <p>Joining queue…</p>}
            {joinError && (
              <p className="text-destructive">{joinError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
