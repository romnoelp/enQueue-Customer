"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LightRays } from "@/components/ui/light-rays";
import { cn } from "@/lib/utils";

export default function AppBackground({ className }: { className?: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);

      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
        hardwareConcurrency?: number;
      };

      const saveData = Boolean(nav.connection?.saveData);
      const deviceMemory = nav.deviceMemory ?? 8;
      const cores = nav.hardwareConcurrency ?? 8;

      // Conservative: treat low memory / few cores / save-data as low-power.
      setLowPower(saveData || deviceMemory <= 4 || cores <= 4);
    };

    update();
    mobileQuery.addEventListener("change", update);
    reducedMotionQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      reducedMotionQuery.removeEventListener("change", update);
    };
  }, []);

  const raysProps = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        count: 0,
        opacity: 0,
        speed: 20,
        blur: 42,
        length: "80vh" as const,
        swing: 0,
        blendMode: "normal" as const,
      };
    }

    // Extra-safe profile for mobile and low-power devices.
    // Goal: keep the effect subtle while minimizing GPU/paint cost.
    if (isMobile || lowPower) {
      return {
        count: 3,
        opacity: 0.32,
        speed: 22,
        blur: 14,
        length: "70vh" as const,
        swing: 0.6,
        blendMode: "normal" as const,
      };
    }

    return {
      count: 7,
      opacity: 0.55,
      speed: 16,
      blur: 34,
      length: "80vh" as const,
      swing: 1,
      blendMode: "screen" as const,
    };
  }, [isMobile, prefersReducedMotion, lowPower]);

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-0", className)}>
      <div className="absolute inset-0 bg-background" />

      <LightRays
        className="absolute inset-0"
        // Pull directly from your theme variables in app/globals.css
        color="color-mix(in srgb, var(--primary) 22%, transparent)"
        blur={raysProps.blur}
        opacity={raysProps.opacity}
        speed={raysProps.speed}
        length={raysProps.length}
        count={raysProps.count}
        swing={raysProps.swing}
        blendMode={raysProps.blendMode}
      />

      {/* Slight fade so content stays readable over the rays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 55%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
