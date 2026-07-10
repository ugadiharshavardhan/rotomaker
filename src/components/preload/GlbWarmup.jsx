"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";

/** Mount inside Canvas to decode GLBs into the drei cache before scenes need them. */
export function GlbWarmup({ onReady }) {
  useGLTF(CAMERA_GLB_PATH);
  useGLTF(EARTH_GLB_PATH);
  useGLTF(DRAGON_GLB_PATH);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return null;
}
