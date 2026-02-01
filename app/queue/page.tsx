"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  collection,
  query,
  where,
  onSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/config/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Purpose } from "@/types/purpose";
import type { Queue } from "@/types/queue";

function getSessionIdFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/sessionId=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function clearSessionCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "sessionId=; path=/; max-age=0; SameSite=Lax";
}


function formatPurpose(p: Purpose): string {
  const labels: Record<Purpose, string> = {
    payment: "Payment",
    registrar: "Registrar",
    clinic: "Clinic",
    auditing: "Auditing",
  };
  return labels[p] ?? p;
}

function formatStatus(status: string): string {
  if (!status) return status;
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export default function Page() {
  const router = useRouter();
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servingAlertOpen, setServingAlertOpen] = useState(false);
  const [counterNumber, setCounterNumber] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  // Queues currently being served at this station (stationId), for "Currently serving" list
  const [servingAtStation, setServingAtStation] = useState<
    Array<{ counterId: string; queueNumber: string }>
  >([]);
  const [counterNumbers, setCounterNumbers] = useState<Record<string, string | null>>({});

  const handleCancelQueue = async () => {
    if (!queue?.id) return;
    setCancelError(null);
    setCancelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
    const sessionId = getSessionIdFromCookies();
    try {
      await axios.post(
        `${baseUrl}/queues/${queue.id}/cancel`,
        { reason: cancelReason },
        {
          params: {
            qrId: sessionId ?? "",
          }
        }
      );
      setCancelDialogOpen(false);
      setCancelReason("");
    } catch (err) {
      setCancelError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Failed to cancel queue"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (!queue?.counterId) {
      void Promise.resolve().then(() => setCounterNumber(null));
      return;
    }
    const counterId = queue.counterId;
    const sessionId = getSessionIdFromCookies();
    const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
    let cancelled = false;
    axios
      .get<{number?: string  }>(
        `${baseUrl}/queues/counters/${counterId}`,
        {
          params: {
            qrId: sessionId,
          },
        }
      )
      .then((response) => {
        if (cancelled) return;
        const number = response.data?.number;
        setCounterNumber(number ?? null);
      })
      .catch(() => {
        if (!cancelled) setCounterNumber(null);
      });
    return () => {
      cancelled = true;
    };
  }, [queue?.counterId]);

  // Listen to queues at this station with status "serving" (currently being served at a counter)
  useEffect(() => {
    const stationId = queue?.stationId;
    if (!stationId) {
      setServingAtStation([]);
      setCounterNumbers({});
      return;
    }

    const q = query(
      collection(db, "queue"),
      where("stationId", "==", stationId),
      where("status", "==", "serving")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const list: Array<{ counterId: string; queueNumber: string }> = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const counterId = data.counterId;
          const queueNumber = data.queueNumber ?? "";
          if (counterId && queueNumber) {
            list.push({ counterId, queueNumber });
          }
        });
        setServingAtStation(list);
      },
      () => {
        setServingAtStation([]);
      }
    );

    return () => unsubscribe();
  }, [queue?.stationId]);

  // Fetch counter number for each counterId in servingAtStation
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
    const sessionId = getSessionIdFromCookies();
    if (!baseUrl || servingAtStation.length === 0) return;

    const counterIds = [...new Set(servingAtStation.map((s) => s.counterId))];
    let cancelled = false;

    const fetchAll = async () => {
      const next: Record<string, string | null> = {};
      await Promise.all(
        counterIds.map(async (counterId) => {
          if (cancelled) return;
          try {
            const res = await axios.get<{ number?: string }>(
              `${baseUrl}/queues/counters/${counterId}`,
              { params: { qrId: sessionId } }
            );
            if (!cancelled) next[counterId] = res.data?.number ?? null;
          } catch {
            if (!cancelled) next[counterId] = null;
          }
        })
      );
      if (!cancelled) setCounterNumbers((prev) => ({ ...prev, ...next }));
    };

    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [servingAtStation]);

  useEffect(() => {
    const sessionId = getSessionIdFromCookies();

    if (!sessionId) {
      router.push("/form");
      return;
    }

    const q = query(
      collection(db, "queue"),
      where("qrId", "==", sessionId),
      where("status", "in", ["waiting", "serving"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        if (snapshot.empty) {
          clearSessionCookies();
          router.push("/unauthorized");
          return;
        }
        const doc = snapshot.docs[0];
        const data = doc.data();
        const newStatus = data.status ?? "";
        setQueue({
          id: doc.id,
          stationId: data.stationId ?? "",
          counterId: data.counterId,
          queueNumber: data.queueNumber ?? "",
          purpose: data.purpose ?? "payment",
          customerEmail: data.customerEmail ?? "",
          status: newStatus,
          position: data.position ?? 0,
          estimatedWaitTime: data.estimatedWaitTime ?? 0,
          qrId: data.qrId,
          createdAt: data.createdAt,
          servedAt: data.servedAt,
          servedBy: data.servedBy,
          completedAt: data.completedAt,
          cancelledAt: data.cancelledAt,
          cancelledBy: data.cancelledBy,
        });
        if (newStatus === "serving" && prevStatusRef.current !== "serving") {
          setServingAlertOpen(true);
        }
        prevStatusRef.current = newStatus;
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err?.message ?? "Failed to load queue status");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (error || !queue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Queue Status</CardTitle>
            <CardDescription>
              {error ?? "No queue data available."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Dialog open={servingAlertOpen} onOpenChange={setServingAlertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your turn — please proceed to the counter</DialogTitle>
            <DialogDescription>
              You are now being served. Please go to{" "}
              {queue.counterId ? (
                <>
                  <span className="font-semibold text-red-600">
                    counter number {counterNumber ?? queue.counterId}
                  </span>
                  {" "}for queue number{" "}
                  <span className="font-semibold text-foreground">{queue.queueNumber}</span>.
                </>
              ) : (
                <>
                  the counter for queue number{" "}
                  <span className="font-semibold text-foreground">{queue.queueNumber}</span>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your Queue Status</CardTitle>
          <CardDescription>
            Here are your queue details. Please wait for your turn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-6">
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Position
              </p>
              <p className="text-3xl font-bold tabular-nums">{queue.position}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Queue Number
              </p>
              <p className="text-2xl font-bold tracking-tight">
                {queue.queueNumber}
              </p>
            </div>
          </div>

          {servingAtStation.length > 0 && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Currently serving
              </p>
              <ul className="space-y-1">
                {servingAtStation.map(({ counterId, queueNumber }) => (
                  <li
                    key={counterId}
                    className="text-sm flex items-center justify-between gap-2"
                  >
                    <span className="text-muted-foreground">
                      Counter {counterNumbers[counterId] ?? counterId}:
                    </span>
                    <span className="font-medium tabular-nums">
                      {queueNumber}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1 text-base">{formatStatus(queue.status)}</dd>
            </div>
            {queue.counterId != null && queue.counterId !== "" && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Counter number
                </dt>
                <dd className="mt-1 text-base font-semibold text-red-600">
                  {counterNumber ?? queue.counterId}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 text-base">{queue.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Purpose
              </dt>
              <dd className="mt-1 text-base">
                {formatPurpose(queue.purpose)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Estimated Waiting Time
              </dt>
              <dd className="mt-1 text-base">
                {typeof queue.estimatedWaitTime === "number"
                  ? `${queue.estimatedWaitTime} ${queue.estimatedWaitTime === 1 ? "minute" : "minutes"}`
                  : queue.estimatedWaitTime}
              </dd>
            </div>
          </dl>

          <div className="pt-4">
            <Button
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
              className="w-full"
            >
              Cancel queue
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setCancelReason("");
            setCancelError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel queue</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling your queue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">Reason</Label>
              <Input
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason"
              />
            </div>
            {cancelError && (
              <p className="text-sm text-destructive">{cancelError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelQueue}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel queue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
