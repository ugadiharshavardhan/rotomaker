"use client";

import { useEffect } from "react";

/**
 * After assets + GPU are ready, wait for forced warm-mounts
 * (Evil Eye, Hyperspeed, galleries, R3F worlds) to settle.
 */
export function ExperienceWarmLayer({ active, onReady }) {
  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    const settle = async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (!cancelled) onReady?.();
    };
    void settle();

    return () => {
      cancelled = true;
    };
  }, [active, onReady]);

  return null;
}
