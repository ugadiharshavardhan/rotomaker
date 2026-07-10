"use client";

import { Suspense, useRef } from "react";
import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  getGlobeApproach,
  getGlobeLayout,
  getGlobeResponsiveScale,
} from "@/lib/globeModelPath";
import { EarthGlobeModel } from "./EarthGlobeModel";
import { EarthGlobeEffects } from "./EarthGlobeEffects";

const GLOBE_LOCKED_SCALE = 0.78;
const GLOBE_FAR_SCALE = 0.2;
const APPROACH_LERP = 0.048;
const SETTLE_LERP = 0.07;
const GLOBE_FACE_YAW = -0.55;

function EarthSceneLighting({ opacity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.35 * opacity} color="#8899bb" />
      <hemisphereLight args={["#334466", "#050508", 0.45 * opacity]} />
      <directionalLight
        position={[6, 3, 5]}
        intensity={1.1 * opacity}
        color="#e8eeff"
        castShadow={false}
      />
      <directionalLight position={[-4, -1, -3]} intensity={0.25 * opacity} color="#4466aa" />
      <Environment preset="night" environmentIntensity={0.28 * opacity} background={false} />
    </>
  );
}

function EarthGlobeScene({ scrollProgress }) {
  const spinRef = useRef();
  const maxScrollRef = useRef(0);
  const isDragging = useRef(false);
  const dragOffset = useRef(0);
  const lastPointerX = useRef(0);
  const resumeSpin = useRef(0);

  maxScrollRef.current = Math.max(maxScrollRef.current, scrollProgress);

  useFrame((state, delta) => {
    if (!spinRef.current) return;
    const scrollSpin = maxScrollRef.current * Math.PI * 0.75;

    if (isDragging.current) {
      resumeSpin.current = 0;
    } else {
      resumeSpin.current = Math.min(1, resumeSpin.current + delta * 0.55);
    }

    const autoSpin = state.clock.elapsedTime * 0.045 * resumeSpin.current;
    spinRef.current.rotation.y =
      GLOBE_FACE_YAW + scrollSpin + autoSpin + dragOffset.current;
  });

  return (
    <group
      ref={spinRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        isDragging.current = true;
        lastPointerX.current = e.clientX;
        e.target.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return;
        dragOffset.current += (e.clientX - lastPointerX.current) * 0.005;
        lastPointerX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        isDragging.current = false;
        e.target.releasePointerCapture(e.pointerId);
      }}
    >
      <EarthGlobeModel />
    </group>
  );
}

export function Scene5World({ progress, opacity = 1 }) {
  const maxProgressRef = useRef(0);
  const lockedLayoutRef = useRef(null);
  const lastWidthRef = useRef(0);
  const groupRef = useRef();
  const currentRef = useRef({ x: 0, y: 0, z: -3.6, scale: GLOBE_FAR_SCALE * 0.65 });
  const targetRef = useRef({ x: 0, y: 0, z: -3.6, scale: GLOBE_FAR_SCALE * 0.65 });
  const { size } = useThree();

  if (opacity <= 0) {
    maxProgressRef.current = 0;
    lockedLayoutRef.current = null;
    currentRef.current = { x: 0, y: 0, z: -3.6, scale: GLOBE_FAR_SCALE * 0.65 };
    targetRef.current = { x: 0, y: 0, z: -3.6, scale: GLOBE_FAR_SCALE * 0.65 };
  } else {
    maxProgressRef.current = Math.max(maxProgressRef.current, progress);
  }

  if (lastWidthRef.current !== size.width) {
    lockedLayoutRef.current = null;
    lastWidthRef.current = size.width;
  }

  const layoutApproach = getGlobeApproach(maxProgressRef.current);
  const scaleFactor = GLOBE_FAR_SCALE + layoutApproach * (GLOBE_LOCKED_SCALE - GLOBE_FAR_SCALE);
  const globeDepth = -3.6 + layoutApproach * 3.6;
  const responsiveScale = getGlobeResponsiveScale(size.width);
  const globeLayout = getGlobeLayout(size.width);
  const targetX = globeLayout.worldX * layoutApproach;
  const targetY = (globeLayout.worldY ?? 0) * layoutApproach;

  if (layoutApproach >= 0.96 && !lockedLayoutRef.current) {
    lockedLayoutRef.current = {
      x: targetX,
      y: targetY,
      depth: globeDepth,
      scale: scaleFactor * responsiveScale,
    };
  }

  targetRef.current = {
    x: lockedLayoutRef.current?.x ?? targetX,
    y: lockedLayoutRef.current?.y ?? targetY,
    z: lockedLayoutRef.current?.depth ?? globeDepth,
    scale: lockedLayoutRef.current?.scale ?? scaleFactor * responsiveScale,
  };

  useFrame((_, delta) => {
    const target = targetRef.current;
    const current = currentRef.current;
    const settled = lockedLayoutRef.current != null;
    const lerp = 1 - Math.exp(-(settled ? SETTLE_LERP : APPROACH_LERP) * 60 * delta);

    current.x += (target.x - current.x) * lerp;
    current.y += (target.y - current.y) * lerp;
    current.z += (target.z - current.z) * lerp;
    current.scale += (target.scale - current.scale) * lerp;

    if (groupRef.current) {
      groupRef.current.position.set(current.x, current.y, current.z);
      groupRef.current.scale.setScalar(current.scale);
    }
  });

  if (opacity <= 0) return null;

  return (
    <>
      <EarthSceneLighting opacity={opacity} />

      <group ref={groupRef} scale={GLOBE_FAR_SCALE * 0.65} position={[0, 0, -3.6]}>
        <Suspense fallback={null}>
          <EarthGlobeScene scrollProgress={progress} />
        </Suspense>
      </group>

      <EarthGlobeEffects opacity={opacity * layoutApproach} />
    </>
  );
}
