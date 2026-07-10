"use client";

import { useLayoutEffect } from "react";
import { warmExperienceAssets } from "@/lib/experienceAssetPreload";

/** Legacy fire-and-forget warmer — MainExperience now awaits waitForExperienceReady. */
export function ExperienceAssetPreloader() {
  useLayoutEffect(() => {
    void warmExperienceAssets();
  }, []);

  return null;
}
