"use client";

import { SERVICES_ANIM_MAP } from "@/components/scene2/ServicesAnimations";

export function Scene4World({ wordKey, wordProgress, opacity = 1 }) {
  const Anim = SERVICES_ANIM_MAP[wordKey];

  if (opacity <= 0 || !Anim) return null;

  return (
    <group>
      <ambientLight intensity={0.06 * opacity} />
      <pointLight position={[0, 0, 5]} intensity={0.8 * opacity} color="#ffffff" />
      <Anim progress={wordProgress} />
    </group>
  );
}
