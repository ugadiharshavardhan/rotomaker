"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GALLERY } from "@/lib/galleryConfig";

export function GalleryLights({ intensity = 1, cameraZRef, exitBright = 0 }) {
  const rimRef = useRef();
  const forwardRef = useRef();
  const fogRef = useRef();

  useFrame(() => {
    const z = cameraZRef?.current ?? 0;
    if (rimRef.current) rimRef.current.position.z = z - GALLERY.LOOK_AHEAD;
    if (forwardRef.current) forwardRef.current.position.z = z - 8;
    if (fogRef.current) {
      fogRef.current.near = GALLERY.FOG_NEAR * (1 - exitBright * 0.7);
      fogRef.current.far = GALLERY.FOG_FAR * (1 - exitBright * 0.55);
    }
  });

  return (
    <>
      <ambientLight intensity={(0.85 + exitBright * 0.6) * intensity} color="#ffffff" />
      <directionalLight
        position={[0, 2, 4]}
        intensity={0.5 * intensity}
        color="#ffffff"
      />
      <directionalLight
        position={[-3, 1, -2]}
        intensity={0.22 * intensity}
        color="#ffffff"
      />
      <pointLight
        ref={forwardRef}
        position={[0, 0, -8]}
        intensity={(0.85 + exitBright * 1.2) * intensity}
        color="#ffffff"
        distance={60}
        decay={1.4}
      />
      <pointLight
        ref={rimRef}
        position={[0, 0, -GALLERY.LOOK_AHEAD]}
        intensity={(1.35 + exitBright * 2.5) * intensity}
        color="#ffffff"
        distance={80}
        decay={1.15}
      />
      <fog
        ref={fogRef}
        attach="fog"
        args={[GALLERY.BG, GALLERY.FOG_NEAR, GALLERY.FOG_FAR]}
      />
    </>
  );
}
