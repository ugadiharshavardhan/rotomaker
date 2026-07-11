"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GALLERY_POSTER_URLS } from "@/lib/galleryPosters";
import { useSafeTextures } from "@/components/portfolio/useSafeTextures";
import { GALLERY } from "@/lib/galleryConfig";
import { PerspectiveTunnel } from "./PerspectiveTunnel";
import { PosterField } from "./Poster";
import { GalleryLights } from "./Lights";
import { GalleryCameraRig } from "./CameraRig";
import { getEntranceReveal, getExitFade, getExitBrighten } from "./ScrollController";

function VanishingCore({ cameraZRef, opacity, brighten }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.z = cameraZRef.current - GALLERY.LOOK_AHEAD * (1.05 - brighten * 0.4);
    const scale = 1 + brighten * 2.4;
    meshRef.current.scale.set(scale, scale, 1);
  });

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <planeGeometry args={[GALLERY.HALF * 2.2, GALLERY.HALF * 2.2]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={Math.min(1, 0.9 * opacity + brighten * 0.35)}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Full infinite perspective movie-poster gallery (R3F world).
 */
export function InfiniteGallery({ progress = 0, opacity = 1, mouse, active = true }) {
  const cameraZRef = useRef(0);
  const textures = useSafeTextures(GALLERY_POSTER_URLS);
  const entrance = getEntranceReveal(progress);
  const exitFade = getExitFade(progress);
  const exitBright = getExitBrighten(progress);

  const visible = opacity > 0.01 && active;
  const contentOpacity = opacity * exitFade;
  const lightIntensity = useMemo(
    () => contentOpacity * (0.55 + entrance * 0.45) * (1 + exitBright * 0.8),
    [contentOpacity, entrance, exitBright]
  );

  if (!visible) return null;

  return (
    <group>
      <color attach="background" args={[GALLERY.BG]} />
      <GalleryLights
        intensity={lightIntensity}
        cameraZRef={cameraZRef}
        exitBright={exitBright}
      />
      <GalleryCameraRig
        progress={progress}
        mouse={mouse}
        cameraZRef={cameraZRef}
        active={visible}
      />
      <PerspectiveTunnel
        cameraZRef={cameraZRef}
        opacity={contentOpacity * entrance * (1 - exitBright * 0.85)}
      />
      <PosterField
        textures={textures}
        cameraZRef={cameraZRef}
        opacity={contentOpacity}
        entrance={entrance * (1 - exitBright * 0.7)}
      />
      <VanishingCore
        cameraZRef={cameraZRef}
        opacity={opacity}
        brighten={exitBright}
      />
    </group>
  );
}
