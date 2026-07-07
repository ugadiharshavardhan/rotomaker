"use client";

import { Suspense, useMemo, useRef } from "react";
import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getGlobeLayout, getGlobeApproach } from "@/lib/globeModelPath";
import { EarthGlobeModel } from "./EarthGlobeModel";
import { EarthPinLayer } from "./EarthPinLayer";
import { EarthGlobeEffects } from "./EarthGlobeEffects";

const GLOBE_LOCKED_SCALE = 0.92;
const GLOBE_FAR_SCALE = 0.28;

function useResponsiveGlobeScale() {
  const { size } = useThree();
  if (size.width < 480) return 0.58;
  if (size.width < 768) return 0.74;
  if (size.width < 1100) return 0.88;
  return 0.96;
}

function FullPageStarfield({ progress, opacity = 1 }) {
  const ref = useRef();
  const count = 420;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 48;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 36 - 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#ffffff"
        transparent
        opacity={(0.12 + progress * 0.28) * opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EarthSceneLighting({ opacity = 1 }) {
  return (
    <>
      <ambientLight intensity={0.4 * opacity} color="#ffffff" />
      <hemisphereLight args={["#ffffff", "#111111", 0.4 * opacity]} />
      <directionalLight
        position={[8, 4, 6]}
        intensity={1.6 * opacity}
        color="#fff8ee"
        castShadow={false}
      />
      <directionalLight position={[-6, -2, -4]} intensity={0.2 * opacity} color="#888888" />
      <Environment preset="night" environmentIntensity={0.35 * opacity} background={false} />
    </>
  );
}

function EarthGlobeScene({ approach, scrollProgress }) {
  const spinRef = useRef();
  const maxScrollRef = useRef(0);
  const isDragging = useRef(false);
  const dragOffset = useRef(0);
  const lastPointerX = useRef(0);

  maxScrollRef.current = Math.max(maxScrollRef.current, scrollProgress);

  useFrame((state) => {
    if (!spinRef.current) return;
    const scrollSpin = maxScrollRef.current * Math.PI * 2.4;
    const autoSpin = isDragging.current ? 0 : state.clock.elapsedTime * 0.07;
    spinRef.current.rotation.y = scrollSpin + autoSpin + dragOffset.current;
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
      <EarthGlobeModel>
        <EarthPinLayer progress={approach} />
      </EarthGlobeModel>
    </group>
  );
}

export function Scene5World({ progress, opacity = 1 }) {
  const maxProgressRef = useRef(0);
  const lockedLayoutRef = useRef(null);

  if (opacity <= 0) {
    maxProgressRef.current = 0;
    lockedLayoutRef.current = null;
  } else {
    maxProgressRef.current = Math.max(maxProgressRef.current, progress);
  }

  const layoutApproach = getGlobeApproach(maxProgressRef.current);
  const scaleFactor = GLOBE_FAR_SCALE + layoutApproach * (GLOBE_LOCKED_SCALE - GLOBE_FAR_SCALE);
  const globeDepth = -3.2 + layoutApproach * 3.2;
  const responsiveScale = useResponsiveGlobeScale();
  const { size } = useThree();
  const globeLayout = getGlobeLayout(size.width);
  const targetX = globeLayout.worldX * layoutApproach;

  if (layoutApproach >= 0.92 && !lockedLayoutRef.current) {
    lockedLayoutRef.current = {
      x: globeLayout.worldX,
      depth: globeDepth,
      scale: scaleFactor * responsiveScale,
    };
  }

  const globeX = lockedLayoutRef.current?.x ?? targetX;
  const globeZ = lockedLayoutRef.current?.depth ?? globeDepth;
  const globeScale = lockedLayoutRef.current?.scale ?? scaleFactor * responsiveScale;

  if (opacity <= 0) return null;

  return (
    <>
      <FullPageStarfield progress={layoutApproach} opacity={opacity} />

      <group scale={globeScale} position={[globeX, 0, globeZ]}>
        <EarthSceneLighting opacity={opacity} />
        <Suspense fallback={null}>
          <EarthGlobeScene approach={layoutApproach} scrollProgress={progress} />
        </Suspense>
      </group>

      <EarthGlobeEffects opacity={opacity * layoutApproach} />
    </>
  );
}
