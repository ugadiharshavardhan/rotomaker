"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GALLERY } from "@/lib/galleryConfig";
import {
  getScrollTravelZ,
  getExitBrighten,
  getHoldSettle,
  GALLERY_HOLD_END,
} from "./ScrollController";

/**
 * Drone-like camera flying down the tunnel center.
 * Title hold keeps Z still; scroll travel starts after the hold.
 */
export function GalleryCameraRig({
  progress,
  mouse = { x: 0.5, y: 0.5 },
  cameraZRef,
  active = true,
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, -GALLERY.LOOK_AHEAD));
  const parallax = useRef({ x: 0, y: 0 });
  const configured = useRef(false);
  const wasActive = useRef(false);
  const lastProgressRef = useRef(progress);

  useFrame((state) => {
    if (!active) {
      wasActive.current = false;
      return;
    }

    const progressJump = Math.abs(progress - lastProgressRef.current) > 0.1;
    lastProgressRef.current = progress;
    const justActivated = !wasActive.current;
    wasActive.current = true;

    if (!configured.current || justActivated) {
      camera.near = 0.05;
      camera.far = 140;
      camera.fov = 56;
      camera.updateProjectionMatrix();
      camera.rotation.z = 0;
      parallax.current.x = 0;
      parallax.current.y = 0;
      configured.current = true;
    }

    const t = state.clock.elapsedTime;
    const travelZ = getScrollTravelZ(progress);
    cameraZRef.current = travelZ;
    const exitBright = getExitBrighten(progress);
    const settle = getHoldSettle(progress);
    const inHold = progress < GALLERY_HOLD_END;
    const calm = 1 - exitBright;

    // During hold: ease from outside into the corridor (no scroll travel yet)
    const startPull = THREE.MathUtils.lerp(5.2, 0, settle);

    const mx = (mouse.x - 0.5) * 2;
    const my = (mouse.y - 0.5) * 2;
    const paraStrength = inHold ? 0.08 : 0.18;
    parallax.current.x += (mx * paraStrength * calm - parallax.current.x) * 0.08;
    parallax.current.y += (-my * (paraStrength * 0.65) * calm - parallax.current.y) * 0.08;

    const swayAmp = inHold ? 0.02 : 0.04;
    const swayX = Math.sin(t * 0.22) * swayAmp * calm;
    const swayY = Math.cos(t * 0.18) * (swayAmp * 0.7) * calm;
    const roll = Math.sin(t * 0.15) * 0.008 * calm + parallax.current.x * 0.01;

    const targetFov = THREE.MathUtils.lerp(56, 72, exitBright);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }

    const targetX = (swayX + parallax.current.x) * calm;
    const targetY = (swayY + parallax.current.y) * calm;
    const targetZ = travelZ + startPull;

    // Softer lerp during hold so the title beat feels still
    const lerpZ = inHold ? 0.07 : 0.14;
    const lerpXY = inHold ? 0.06 : 0.12;

    if (justActivated || progressJump) {
      camera.position.set(targetX, targetY, targetZ);
    } else {
      camera.position.x += (targetX - camera.position.x) * lerpXY;
      camera.position.y += (targetY - camera.position.y) * lerpXY;
      camera.position.z += (targetZ - camera.position.z) * lerpZ;
    }

    lookTarget.current.set(
      parallax.current.x * 0.25 * calm,
      parallax.current.y * 0.2 * calm,
      camera.position.z - GALLERY.LOOK_AHEAD * (1 - exitBright * 0.35)
    );
    camera.lookAt(lookTarget.current);
    camera.rotation.z = roll;
  });

  return null;
}
