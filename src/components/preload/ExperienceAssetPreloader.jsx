"use client";

import { useLayoutEffect } from "react";
import { warmExperienceAssets } from "@/lib/experienceAssetPreload";

export function ExperienceAssetPreloader() {
  useLayoutEffect(() => {
    void warmExperienceAssets();
  }, []);

  return null;
}
