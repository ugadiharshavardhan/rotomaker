"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getHeroStoryState } from "@/lib/heroStory";

/**
 * Story camera — character push during reveals; finale pull into 360° cinema hall.
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
      const open = Math.min(1, Math.max(0, (s.local - 0.02) / 0.65));
      const eased = open * open * (3 - 2 * open);

      // Inside the circular hall: start nearer the front wall, pull to center
      // so more of the 360° ring enters frame. Never stop moving.
      camera.near = 0.1;
      camera.far = 140;
      const targetZ = THREE.MathUtils.lerp(-6.5, 0.35, eased);
      const orbit = Math.sin(t * 0.07) * (0.14 + eased * 0.18);
      const breathY = Math.cos(t * 0.09) * 0.05;
      const breathZ = Math.sin(t * 0.055) * 0.08;

      const targetX = orbit + mx * 0.06;
      const targetY = 0.42 + breathY - my * 0.035;

      camera.position.x += (targetX - camera.position.x) * 0.028;
      camera.position.y += (targetY - camera.position.y) * 0.028;
      camera.position.z += (targetZ + breathZ - camera.position.z) * 0.024;

      look.current.set(mx * 0.05, 0.18 - my * 0.03, -12 - eased * 8);
      camera.lookAt(look.current);
      camera.fov = THREE.MathUtils.lerp(48, 42, eased);
      camera.updateProjectionMatrix();
      return;
    }

    const breathX = Math.sin(t * 0.18) * 0.04;
    const breathY = Math.cos(t * 0.14) * 0.03;
    const breathZ = Math.sin(t * 0.11) * 0.06;
    const push = s.cameraPush;

    const targetX = breathX + mx * 0.06;
    const targetY = 0.32 + breathY - my * 0.04;
    const targetZ = 5.4 - push + breathZ;

    camera.position.x += (targetX - camera.position.x) * 0.045;
    camera.position.y += (targetY - camera.position.y) * 0.045;
    camera.position.z += (targetZ - camera.position.z) * 0.04;

    look.current.set(mx * 0.08 + s.bodyX * 0.04, 0.12 - my * 0.05, -5);
    camera.lookAt(look.current);
  });

  return null;
}
