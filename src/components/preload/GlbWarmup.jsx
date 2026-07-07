"use client";

import { useGLTF } from "@react-three/drei";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";

/** Mount inside Canvas to decode GLBs into the drei cache before scenes need them. */
export function GlbWarmup() {
  useGLTF(CAMERA_GLB_PATH);
  useGLTF(EARTH_GLB_PATH);
  return null;
}
