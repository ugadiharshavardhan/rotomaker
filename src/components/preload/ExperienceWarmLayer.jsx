"use client";

import { useEffect } from "react";

/**
 * After assets + GPU are ready, briefly settle then unlock the experience.
 * Heavy WebGL effects mount on-demand per section — do not wait for them here.
 */
export function ExperienceWarmLayer({ active, onReady }) {
  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    const settle = async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (!cancelled) onReady?.();
    };
    void settle();

    return () => {
      cancelled = true;
    };
  }, [active, onReady]);

  return null;
}
