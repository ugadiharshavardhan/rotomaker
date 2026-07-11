"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GALLERY } from "@/lib/galleryConfig";
import { GridWall } from "./GridWall";

/**
 * Recycles a fixed pool of tunnel segments ahead of the camera
 * so the corridor never ends.
 */
export function PerspectiveTunnel({ cameraZRef, opacity = 1 }) {
  const groupRefs = useRef([]);
  const initialized = useRef(false);
  const totalLen = GALLERY.SEG_COUNT * GALLERY.SEG_LEN;

  useFrame(() => {
    const camZ = cameraZRef.current;
    const refs = groupRefs.current;

    if (!initialized.current) {
      for (let i = 0; i < GALLERY.SEG_COUNT; i++) {
        const g = refs[i];
        if (g) g.position.z = -i * GALLERY.SEG_LEN;
      }
      initialized.current = true;
    }

    const behind = GALLERY.SEG_LEN * 1.25;
    const ahead = totalLen - behind;

    for (let i = 0; i < GALLERY.SEG_COUNT; i++) {
      const g = refs[i];
      if (!g) continue;
      while (g.position.z > camZ + behind) {
        g.position.z -= totalLen;
      }
      while (g.position.z < camZ - ahead) {
        g.position.z += totalLen;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: GALLERY.SEG_COUNT }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <GridWall opacity={opacity} />
        </group>
      ))}
    </group>
  );
}
