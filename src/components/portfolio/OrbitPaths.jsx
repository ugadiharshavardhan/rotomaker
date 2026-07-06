"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function buildInfiniteStreamGeometry(radius, depth, phase, span, segments = 140) {
  const positions = new Float32Array((segments + 1) * 3);
  const colors = new Float32Array((segments + 1) * 3);

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const t = f * span + phase;
    positions[i * 3] = Math.cos(t) * radius;
    positions[i * 3 + 1] = Math.sin(t * 1.25) * 1.6;
    positions[i * 3 + 2] = Math.sin(t * 0.65) * 4 + depth;

    const edgeFade = Math.min(f / 0.14, (1 - f) / 0.14, 1);
    const v = edgeFade * 0.85;
    colors[i * 3] = v;
    colors[i * 3 + 1] = v;
    colors[i * 3 + 2] = v;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function InfiniteStream({ progress, opacity, phase = 0, radius = 12, depth = -6.5 }) {
  const groupRef = useRef();
  const materialRef = useRef();
  const span = Math.PI * 2.8;

  const geometry = useMemo(
    () => buildInfiniteStreamGeometry(radius, depth, phase, span),
    [radius, depth, phase, span]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.09 + phase;
    groupRef.current.rotation.x = Math.sin(t * 0.17 + phase) * 0.14;
    groupRef.current.position.y = Math.sin(t * 0.28 + phase) * 0.2;
    if (materialRef.current) {
      materialRef.current.opacity = (0.1 + progress * 0.16) * opacity;
    }
  });

  return (
    <group ref={groupRef} scale={0.92 + progress * 0.08}>
      <line geometry={geometry}>
        <lineBasicMaterial
          ref={materialRef}
          vertexColors
          transparent
          opacity={(0.1 + progress * 0.16) * opacity}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
}

export function OrbitPaths({ progress, opacity = 1, count = 2 }) {
  if (opacity <= 0) return null;

  return (
    <group>
      <InfiniteStream progress={progress} opacity={opacity} phase={0} radius={13} depth={-7.5} />
      {count > 1 && (
        <InfiniteStream
          progress={progress}
          opacity={opacity * 0.55}
          phase={Math.PI * 0.85}
          radius={10.5}
          depth={-5.8}
        />
      )}
    </group>
  );
}
