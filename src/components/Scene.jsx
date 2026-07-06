"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
  getVfxLocalProgress,
  shouldShowGlbCamera,
} from "@/lib/cameraLens";

function CameraOrbitRig({ scrollProgress }) {
  const { camera } = useThree();
  const dampedPos = useRef(new THREE.Vector3(0, 0.65, 7));
  const dampedLook = useRef(new THREE.Vector3(...CAMERA_LENS_TARGET));
  const dampedFov = useRef(45);

  useFrame((_, delta) => {
    const zoom = getCameraZoom(scrollProgress);
    const { dive } = getCameraPhase(scrollProgress);
    const damp = 1 - Math.pow(0.001, delta);
    const lens = new THREE.Vector3(...CAMERA_LENS_TARGET);

    let targetPos;
    let targetLook;
    let targetFov = 45;

    if (dive <= 0.001) {
      const orbitAngle = zoom * Math.PI * 0.32;
      const radius = THREE.MathUtils.lerp(7, 4.2, easeInOutCubic(zoom));
      const height = THREE.MathUtils.lerp(0.65, 0.32, zoom);

      targetPos = new THREE.Vector3(
        Math.sin(orbitAngle) * radius,
        height,
        Math.cos(orbitAngle) * radius
      );
      targetLook = lens.clone();
      targetFov = THREE.MathUtils.lerp(45, 36, zoom);
    } else {
      const eased = easeInCubic(dive);
      const approach = new THREE.Vector3(0.12, 0.3, 3.4);
      const atLens = new THREE.Vector3(0.06, 0.24, 1.75);
      const through = new THREE.Vector3(0.02, 0.22, 0.35);

      if (eased < 0.5) {
        const local = eased / 0.5;
        targetPos = approach.clone().lerp(atLens, easeInOutCubic(local));
        targetLook = lens.clone();
        targetFov = THREE.MathUtils.lerp(36, 22, local);
      } else {
        const local = (eased - 0.5) / 0.5;
        targetPos = atLens.clone().lerp(through, easeInCubic(local));
        targetLook = new THREE.Vector3(0, 0.2, -10);
        targetFov = THREE.MathUtils.lerp(22, 8, local);
      }
    }

    dampedPos.current.lerp(targetPos, damp);
    dampedLook.current.lerp(targetLook, damp);
    dampedFov.current = THREE.MathUtils.lerp(dampedFov.current, targetFov, damp);

    camera.position.copy(dampedPos.current);
    camera.lookAt(dampedLook.current);
    camera.fov = dampedFov.current;
    camera.updateProjectionMatrix();
  });

  return null;
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

  const isDev = process.env.NODE_ENV === "development";

  return (
    <group visible={sceneOpacity > 0.01}>
      <Lighting intensity={sceneOpacity * (1 - dive * 0.2)} variant="studio" />
      <CameraModel
        scrollProgress={scrollProgress}
        opacity={sceneOpacity * modelFade}
      />
      {isDev ? (
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />
      ) : (
        <CameraOrbitRig scrollProgress={scrollProgress} />
      )}
      <Effects enabled={sceneOpacity > 0.15 && dive < 0.85} />
    </group>
  );
}
