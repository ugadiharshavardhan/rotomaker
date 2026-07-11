"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getGlobeLayout } from "@/lib/globeModelPath";

import { getSceneBounds } from "@/lib/sceneConfig";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isGlobeScene(globalProgress) {
  const { start, end } = getSceneBounds(6);
  return globalProgress >= start && globalProgress < end;
}

function getBaseZ(globalProgress, scenes) {
  const p3 = scenes[2]?.progress ?? 0;
  const p4 = scenes[3]?.progress ?? 0;
  const p7 = scenes[6]?.progress ?? 0;
  const p8 = scenes[7]?.progress ?? 0;
  const p9 = scenes[8]?.progress ?? 0;
  const p10 = scenes[9]?.progress ?? 0;
  const p11 = scenes[10]?.progress ?? 0;
  const p12 = scenes[11]?.progress ?? 0;
  const p13 = scenes[12]?.progress ?? 0;
  const introEnd = getSceneBounds(1).end;
  const portfolioEnd = getSceneBounds(2).end;

  if (globalProgress < introEnd) {
    const enter = Math.min(1, scenes[0].progress / 0.2);
    return lerp(14, 6.5, enter) - scenes[0].progress * 2;
  }
  if (globalProgress < portfolioEnd) return lerp(6.5, 8, scenes[1].progress);
  if (globalProgress < getSceneBounds(3).end) return lerp(10, 7, p3);
  if (globalProgress < getSceneBounds(6).start + 0.04) return lerp(8, 6, p4);
  if (isGlobeScene(globalProgress)) {
    return 8.4;
  }
  if (globalProgress < getSceneBounds(8).start) return lerp(9.2, 8.8, p7);
  if (globalProgress < getSceneBounds(9).start) return lerp(8, 7, p8);
  if (globalProgress < getSceneBounds(10).start) return lerp(8, 6, p9);
  if (globalProgress < getSceneBounds(11).start) return lerp(7, 8.5, p10);
  if (globalProgress < getSceneBounds(12).start) return lerp(9, 7, p11);
  if (globalProgress < getSceneBounds(13).start) return lerp(8, 6.5, p12);
  return lerp(7, 5, p13);
}

function getBaseY(globalProgress, scenes) {
  if (globalProgress < getSceneBounds(1).end) {
    return lerp(2, 0.2, Math.min(1, scenes[0].progress / 0.2));
  }
  if (globalProgress >= getSceneBounds(13).start) {
    const exitP = scenes[12]?.progress ?? 0;
    return lerp(0.2, 2.5, exitP);
  }
  return 0.2;
}

function isStoryScene(globalProgress) {
  const { start } = getSceneBounds(7);
  const { start: ctaStart } = getSceneBounds(13);
  return globalProgress >= start && globalProgress < ctaStart;
}

function isPortfolioScene(globalProgress) {
  const { start, end } = getSceneBounds(2);
  return globalProgress >= start && globalProgress < end;
}

const DEFAULT_FOV = 45;
const SNAP_DISTANCE = 1.35;

/**
 * Shared camera for non-GLB / non-tunnel scenes.
 * Keeps X centered except for the intentional globe framing offset.
 * Snaps on large jumps so fast scroll / reverse scroll never leave
 * models stuck on the left from a previous section's camera pose.
 */
export function HollywoodCameraRig({ sceneState }) {
  const { camera, size } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const cameraTarget = useRef(new THREE.Vector3(0, 1.2, 5.5));
  const maxGlobeProgress = useRef(0);
  const needsSnap = useRef(true);
  const lastModeRef = useRef("");
  const { globalProgress, scenes, microBeat } = sceneState;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = microBeat?.float ?? globalProgress * 100;
    const portfolio = isPortfolioScene(globalProgress);
    const globe = isGlobeScene(globalProgress);
    const story = isStoryScene(globalProgress);
    const steadyCamera = portfolio || globe || story;
    const mode = globe ? "globe" : portfolio ? "portfolio" : story ? "story" : "default";

    if (lastModeRef.current !== mode) {
      lastModeRef.current = mode;
      needsSnap.current = true;
    }

    if (!globe) {
      if (globalProgress < getSceneBounds(6).start) maxGlobeProgress.current = 0;
    } else {
      maxGlobeProgress.current = Math.max(
        maxGlobeProgress.current,
        scenes[5]?.progress ?? 0
      );
    }

    const globeApproach = globe ? maxGlobeProgress.current / 0.52 : 0;
    const globeEase = Math.min(1, Math.max(0, globeApproach));
    const globeSmooth = globeEase * globeEase * globeEase * (globeEase * (globeEase * 6 - 15) + 10);

    const globeLayout = getGlobeLayout(size.width);
    const isMobileGlobe = size.width < 768;

    let baseZ = getBaseZ(globalProgress, scenes);
    if (globe) {
      baseZ = lerp(7.2, isMobileGlobe ? 10.2 : 9.4, globeSmooth);
    }
    const baseY = getBaseY(globalProgress, scenes);

    // Stay centered for every section except the globe's deliberate framing.
    // The old sin(progress) X drift left models stuck on the left during fast/reverse scroll.
    let baseX = 0;
    let lookX = 0;
    let lookY = 0.1;
    if (globe) {
      baseX = lerp(0, globeLayout.cameraX, globeSmooth);
      lookX = lerp(0, globeLayout.lookX, globeSmooth);
      lookY = lerp(0.1, 0.1 + (globeLayout.worldY ?? 0) * 0.35, globeSmooth);
    }

    const orbitX = steadyCamera ? 0 : Math.sin(t * 0.11 + beat * 0.05) * 0.06;
    const orbitY = steadyCamera ? 0 : Math.cos(t * 0.09 + beat * 0.04) * 0.04;
    const dolly = steadyCamera ? 0 : Math.sin(t * 0.13 + globalProgress * 3) * 0.18;
    const crane = steadyCamera ? 0 : Math.sin(t * 0.07 + globalProgress * 2) * 0.08;
    const push = steadyCamera ? 0 : Math.sin(beat * 0.3) * 0.04;

    let exitPull = 0;
    let exitLift = 0;
    let lookDown = 0;
    if (globalProgress >= getSceneBounds(13).start) {
      const exitP = scenes[12]?.progress ?? 0;
      exitPull = exitP * 14;
      exitLift = exitP * 2.8;
      lookDown = exitP * 1.2;
    }

    cameraTarget.current.set(
      baseX + orbitX,
      baseY + orbitY + crane + exitLift + push * 0.15,
      baseZ + dolly - exitPull
    );

    const dist = camera.position.distanceTo(cameraTarget.current);
    const snap = needsSnap.current || dist > SNAP_DISTANCE;
    if (snap) {
      camera.position.copy(cameraTarget.current);
      lookTarget.current.set(lookX, lookY - lookDown, 0);
      camera.fov = DEFAULT_FOV;
      camera.updateProjectionMatrix();
      needsSnap.current = false;
    } else {
      const camLerp = globe ? 0.08 : steadyCamera ? 0.16 : 0.14;
      camera.position.lerp(cameraTarget.current, camLerp);
      lookTarget.current.set(
        lookX,
        lookY - lookDown + (steadyCamera ? 0 : Math.cos(t * 0.08) * 0.03),
        0
      );
      if (Math.abs(camera.fov - DEFAULT_FOV) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, DEFAULT_FOV, 0.25);
        camera.updateProjectionMatrix();
      }
    }

    camera.lookAt(lookTarget.current);
    camera.rotation.z = 0;
  });

  return null;
}
