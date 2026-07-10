"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";

/**
 * Decode the camera GLB into the drei cache before the intro needs it.
 * Earth/dragon preload in the background so a missing optional model
 * cannot hang Suspense and block the whole experience.
 */
export function GlbWarmup({ onReady }) {
  useGLTF(CAMERA_GLB_PATH);

  useEffect(() => {
    onReady?.();

    try {
      useGLTF.preload(EARTH_GLB_PATH);
      useGLTF.preload(DRAGON_GLB_PATH);
    } catch {
      // Optional models — ignore preload failures.
    }
  }, [onReady]);

  return null;
}
