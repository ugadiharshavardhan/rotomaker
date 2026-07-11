"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraModel } from "./CameraModel";
import { Lighting } from "./Lighting";
import { Effects } from "./Effects";
import {
  CAMERA_LENS_TARGET,
  easeInCubic,
  easeInOutCubic,
  getCameraPhase,
  getCameraZoom,
  getLensFaceAmount,
  getVfxLocalProgress,
  shouldShowGlbCamera,
} from "@/lib/cameraLens";
import { getCameraViewportLayout } from "@/lib/cameraLayout";

function CameraOrbitRig({ scrollProgress }) {
  const { camera, size } = useThree();
  const layout = getCameraViewportLayout(size.width, size.height);
  const dampedPos = useRef(new THREE.Vector3(0, 0.65, 7));
  const dampedLook = useRef(new THREE.Vector3(...CAMERA_LENS_TARGET));
  const dampedFov = useRef(45);
  const hasSnapped = useRef(false);
  const lastSizeRef = useRef({ w: size.width, h: size.height });
  const lastProgressRef = useRef(scrollProgress);

  if (lastSizeRef.current.w !== size.width || lastSizeRef.current.h !== size.height) {
    lastSizeRef.current = { w: size.width, h: size.height };
    hasSnapped.current = false;
  }

  // Fast / reverse scroll jumps leave damping mid-orbit on the left — resync.
  if (Math.abs(scrollProgress - lastProgressRef.current) > 0.08) {
    hasSnapped.current = false;
  }
  lastProgressRef.current = scrollProgress;

  useFrame((_, delta) => {
    const zoom = getCameraZoom(scrollProgress);
    const { dive } = getCameraPhase(scrollProgress);
    const faceLens = getLensFaceAmount(scrollProgress);
    const damp = 1 - Math.pow(faceLens > 0.2 ? 0.00012 : 0.0004, delta);
    const lens = new THREE.Vector3(...CAMERA_LENS_TARGET);
    const modelCenter = new THREE.Vector3(0, layout.modelOffsetY ?? 0, 0);

    const baseRadius =
      (layout.orbitRadius ?? THREE.MathUtils.lerp(7, 4.2, easeInOutCubic(zoom))) *
      (layout.orbitRadiusScale ?? 1);
    const baseHeight =
      (layout.orbitHeight ?? THREE.MathUtils.lerp(0.65, 0.32, zoom)) +
      (layout.cameraHeightOffset ?? 0);

    let targetPos;
    let targetLook;
    let targetFov = 45;

    if (dive <= 0.001) {
      // Keep the view frontal / centered — no side orbit that reads as "stuck left"
      const radius = THREE.MathUtils.lerp(baseRadius, baseRadius * 0.9, faceLens);
      const height = THREE.MathUtils.lerp(baseHeight, 0.34, faceLens);

      targetPos = new THREE.Vector3(0, height, radius);
      targetLook = modelCenter.clone().lerp(lens, faceLens * 0.75);
      targetFov =
        layout.orbitFov != null
          ? layout.orbitFov + (layout.fovBoost ?? 0)
          : THREE.MathUtils.lerp(
              45 + (layout.fovBoost ?? 0),
              36 + (layout.fovBoost ?? 0),
              zoom
            );
    } else {
      // Continuous push from the front-facing orbit into the lens — never sideways
      const eased = easeInCubic(dive);
      const front = new THREE.Vector3(0, 0.36, baseRadius * 0.92);
      const approach = new THREE.Vector3(0, 0.34, 5.1);
      const atLens = new THREE.Vector3(0, 0.3, 4.15);
      const through = new THREE.Vector3(0, 0.26, 3.35);

      if (eased < 0.35) {
        const local = eased / 0.35;
        targetPos = front.clone().lerp(approach, easeInOutCubic(local));
        targetLook = lens.clone();
        targetFov = THREE.MathUtils.lerp(
          layout.orbitFov != null ? layout.orbitFov : 36,
          32,
          local
        );
      } else if (eased < 0.7) {
        const local = (eased - 0.35) / 0.35;
        targetPos = approach.clone().lerp(atLens, easeInOutCubic(local));
        targetLook = lens.clone();
        targetFov = THREE.MathUtils.lerp(32, 28, local);
      } else {
        const local = (eased - 0.7) / 0.3;
        targetPos = atLens.clone().lerp(through, easeInOutCubic(local));
        targetLook = lens.clone().lerp(new THREE.Vector3(0, 0.22, 0.4), local * 0.35);
        targetFov = THREE.MathUtils.lerp(28, 24, local);
      }
    }

    if (!hasSnapped.current) {
      dampedPos.current.copy(targetPos);
      dampedLook.current.copy(targetLook);
      dampedFov.current = targetFov;
      hasSnapped.current = true;
    } else {
      dampedPos.current.lerp(targetPos, damp);
      dampedLook.current.lerp(targetLook, damp);
      dampedFov.current = THREE.MathUtils.lerp(dampedFov.current, targetFov, damp);
    }

    camera.position.copy(dampedPos.current);
    camera.lookAt(dampedLook.current);
    camera.rotation.z = 0;
    camera.fov = dampedFov.current;
    camera.updateProjectionMatrix();
  });

  return null;
}

function CameraStudioContent({ scrollProgress, sceneOpacity, modelFade, dive }) {
  const { size } = useThree();
  const compactStudio = size.width < 768;

  return (
    <>
      <Lighting
        intensity={sceneOpacity * (1 - dive * 0.2)}
        variant="studio"
        compact={compactStudio}
      />
      <CameraModel
        scrollProgress={scrollProgress}
        opacity={sceneOpacity * modelFade}
      />
      <CameraOrbitRig scrollProgress={scrollProgress} />
      <Effects
        enabled={sceneOpacity > 0.15 && dive < 0.85}
        studio
      />
    </>
  );
}

export function Scene({ scrollProgress = 0, opacity = 1 }) {
  if (!shouldShowGlbCamera(scrollProgress, opacity)) return null;

  const local = getVfxLocalProgress(scrollProgress);
  const { dive } = getCameraPhase(scrollProgress);
  const fadeIn = Math.min(1, local / 0.08);
  const fadeOut = local > 0.9 ? Math.max(0, 1 - (local - 0.9) / 0.1) : 1;
  const sceneOpacity = fadeIn * fadeOut * opacity;

  const modelFade = local > 0.85 ? Math.max(0, 1 - (local - 0.85) / 0.15) : 1;

  if (sceneOpacity <= 0.01) return null;

  return (
    <group visible={sceneOpacity > 0.01}>
      <CameraStudioContent
        scrollProgress={scrollProgress}
        sceneOpacity={sceneOpacity}
        modelFade={modelFade}
        dive={dive}
      />
    </group>
  );
}
