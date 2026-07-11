"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getHeroStoryState } from "@/lib/heroStory";

/**
 * Story camera — character push during reveals;
 * finale sits at the center of the 360° poster cylinder.
 */
export function HeroCameraRig({ progress, mouse = { x: 0.5, y: 0.5 }, active = true }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.15, -5));
  const configured = useRef(false);

  useFrame((state) => {
    if (!active) return;

    if (!configured.current) {
      camera.near = 0.1;
      camera.far = 140;
      camera.fov = 46;
      camera.updateProjectionMatrix();
      configured.current = true;
    }

    const t = state.clock.elapsedTime;
    const s = getHeroStoryState(progress);
    const mx = (mouse.x - 0.5) * 2;
    const my = (mouse.y - 0.5) * 2;

    if (s.phase === "finale") {
      const open = Math.min(1, Math.max(0, (s.local - 0.02) / 0.55));
      const eased = open * open * (3 - 2 * open);

      camera.near = 0.15;
      camera.far = 80;

      const targetZ = THREE.MathUtils.lerp(1.2, 0.15, eased);
      const orbit = Math.sin(t * 0.06) * (0.2 + eased * 0.25);
      const breathY = Math.cos(t * 0.08) * 0.06;

      camera.position.x += (orbit + mx * 0.08 - camera.position.x) * 0.03;
      camera.position.y += (0.35 + breathY - my * 0.04 - camera.position.y) * 0.03;
      camera.position.z += (targetZ - camera.position.z) * 0.026;

      look.current.set(mx * 0.15, 0.1 - my * 0.05, -10);
      camera.lookAt(look.current);
      camera.fov = THREE.MathUtils.lerp(58, 52, eased);
      camera.updateProjectionMatrix();
      return;
    }

    // Restore story camera quickly when scrolling back from finale
    camera.near = 0.1;
    camera.far = 120;
    const breathX = Math.sin(t * 0.18) * 0.04;
    const breathY = Math.cos(t * 0.14) * 0.03;
    const breathZ = Math.sin(t * 0.11) * 0.06;
    const push = s.cameraPush;

    const targetX = breathX + mx * 0.06;
    const targetY = 0.32 + breathY - my * 0.04;
    const targetZ = 5.4 - push + breathZ;
    // Snappier return from finale; soft tracking during character reveals
    const fromFinale =
      Math.abs(camera.position.z - targetZ) > 1.5 || Math.abs(camera.fov - 46) > 4;
    const lerp = fromFinale ? 0.12 : 0.045;

    camera.position.x += (targetX - camera.position.x) * lerp;
    camera.position.y += (targetY - camera.position.y) * lerp;
    camera.position.z += (targetZ - camera.position.z) * lerp;

    look.current.set(mx * 0.08 + s.bodyX * 0.04, 0.12 - my * 0.05, -5);
    camera.lookAt(look.current);
    if (Math.abs(camera.fov - 46) > 0.05) {
      camera.fov += (46 - camera.fov) * (fromFinale ? 0.12 : 0.08);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
