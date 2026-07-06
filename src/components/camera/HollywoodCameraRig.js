"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getGlobeLayout } from "@/lib/globeModelPath";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isGlobeScene(globalProgress) {
  return globalProgress >= 0.565 && globalProgress < 0.708;
}

function getBaseZ(globalProgress, scenes) {
  const p3 = scenes[2]?.progress ?? 0;
  const p4 = scenes[3]?.progress ?? 0;
  const p5 = scenes[4]?.progress ?? 0;
  const p6 = scenes[5]?.progress ?? 0;
  const p7 = scenes[6]?.progress ?? 0;
  const p8 = scenes[7]?.progress ?? 0;
  const p9 = scenes[8]?.progress ?? 0;
  const p10 = scenes[9]?.progress ?? 0;
  const p11 = scenes[10]?.progress ?? 0;
  const p12 = scenes[11]?.progress ?? 0;
  const p13 = scenes[12]?.progress ?? 0;

  if (globalProgress < 0.145) {
    const enter = Math.min(1, scenes[0].progress / 0.2);
    return lerp(14, 6.5, enter) - scenes[0].progress * 2;
  }
  if (globalProgress < 0.305) return lerp(6.5, 8, scenes[1].progress);
  if (globalProgress < 0.565) return lerp(10, 7, p3);
  if (globalProgress < 0.635) return lerp(8, 6, p4);
  if (isGlobeScene(globalProgress)) {
    return 8.4;
  }
  if (globalProgress < 0.815) return lerp(9.2, 8.8, p7);
  if (globalProgress < 0.875) return lerp(8, 7, p8);
  if (globalProgress < 0.905) return lerp(8, 6, p9);
  if (globalProgress < 0.955) return lerp(7, 8.5, p10);
  if (globalProgress < 0.98) return lerp(9, 7, p11);
  if (globalProgress < 0.992) return lerp(8, 6.5, p12);
  return lerp(7, 5, p13);
}

function getBaseY(globalProgress, scenes) {
  if (globalProgress < 0.145) {
    return lerp(2, 0.2, Math.min(1, scenes[0].progress / 0.2));
  }
  if (globalProgress >= 0.96) {
    const exitP = scenes[12]?.progress ?? 0;
    return lerp(0.2, 2.5, exitP);
  }
  return 0.2;
}

function getBaseX(globalProgress, scenes) {
  if (globalProgress >= 0.145 && globalProgress < 0.305) {
    return 0;
  }
  if (isGlobeScene(globalProgress)) {
    return 0.08;
  }
  return Math.sin(globalProgress * Math.PI * 2) * 0.35;
}

function isPortfolioScene(globalProgress) {
  return globalProgress >= 0.145 && globalProgress < 0.305;
}

export function HollywoodCameraRig({ sceneState }) {
  const { camera, size } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const maxGlobeProgress = useRef(0);
  const { globalProgress, scenes, microBeat } = sceneState;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const beat = microBeat?.float ?? globalProgress * 100;
    const portfolio = isPortfolioScene(globalProgress);
    const globe = isGlobeScene(globalProgress);
    const steadyCamera = portfolio || globe;

    if (!globe) {
      if (globalProgress < 0.565) maxGlobeProgress.current = 0;
    } else {
      maxGlobeProgress.current = Math.max(
        maxGlobeProgress.current,
        scenes[5]?.progress ?? 0
      );
    }

    const globeApproach = globe
      ? maxGlobeProgress.current / 0.38
      : 0;
    const globeEase = Math.min(1, globeApproach);
    const globeSmooth = globeEase * globeEase * (3 - 2 * globeEase);

    const globeLayout = getGlobeLayout(size.width);

    let baseZ = getBaseZ(globalProgress, scenes);
    if (globe) {
      baseZ = lerp(14.2, 8.4, globeSmooth);
    }
    const baseY = getBaseY(globalProgress, scenes);
    let baseX = getBaseX(globalProgress, scenes);
    let lookX = baseX * 0.5;
    if (globe) {
      baseX = lerp(0, globeLayout.cameraX, globeSmooth);
      lookX = lerp(0, globeLayout.lookX, globeSmooth);
    } else if (portfolio) {
      lookX = 0;
    }
    const orbitX = steadyCamera ? 0 : Math.sin(t * 0.11 + beat * 0.05) * 0.28;
    const orbitY = steadyCamera ? 0 : Math.cos(t * 0.09 + beat * 0.04) * 0.14;
    const dolly = steadyCamera ? 0 : Math.sin(t * 0.13 + globalProgress * 3) * 0.35;
    const crane = steadyCamera ? 0 : Math.sin(t * 0.07 + globalProgress * 2) * 0.18;
    const push = steadyCamera ? 0 : Math.sin(beat * 0.3) * 0.12;

    let exitPull = 0;
    let exitLift = 0;
    let lookDown = 0;
    if (globalProgress >= 0.96) {
      const exitP = scenes[12]?.progress ?? 0;
      exitPull = exitP * 14;
      exitLift = exitP * 2.8;
      lookDown = exitP * 1.2;
    }

    camera.position.set(
      baseX + orbitX,
      baseY + orbitY + crane + exitLift,
      baseZ + dolly - exitPull
    );

    lookTarget.current.set(
      lookX,
      0.1 - lookDown + (steadyCamera ? 0 : Math.cos(t * 0.08) * 0.08),
      0
    );
    camera.lookAt(lookTarget.current);
  });

  return null;
}
