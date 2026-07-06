"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function TrackAnimation({ progress }) {
  const ref = useRef();
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      pts.push(new THREE.Vector3((t - 0.5) * 10, Math.sin(t * Math.PI * 3) * 2, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.2 + progress * 0.5;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <line ref={ref} geometry={points}>
      <lineBasicMaterial color="#888888" transparent opacity={0.4} />
    </line>
  );
}

export function PaintAnimation({ progress }) {
  const ref = useRef();
  const count = 200;
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame((state) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const t = state.clock.elapsedTime * 0.3 + i;
      arr[i * 3] = Math.sin(t * 0.5 + i) * 5;
      arr[i * 3 + 1] = Math.cos(t * 0.3 + i * 0.2) * 3;
      arr[i * 3 + 2] = Math.sin(t * 0.7) * 2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.3 + progress * 0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function KeyAnimation({ progress }) {
  return (
    <mesh position={[0, 0, -2]} scale={[8, 5, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.06 + progress * 0.1} />
    </mesh>
  );
}

export function CompositeAnimation({ progress }) {
  const layers = [-1.5, -0.5, 0.5, 1.5];
  return (
    <group>
      {layers.map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[0, 0, i * 0.05]}>
          <planeGeometry args={[6 - i * 0.5, 3.5 - i * 0.3]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05 + progress * 0.08} />
        </mesh>
      ))}
    </group>
  );
}

export function WorldsAnimation({ progress }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12 + progress * 0.2} />
      </mesh>
      <mesh scale={1.3}>
        <icosahedronGeometry args={[2.5, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05 + progress * 0.1} />
      </mesh>
    </group>
  );
}

export const SERVICES_ANIM_MAP = {
  intro: null,
  track: TrackAnimation,
  paint: PaintAnimation,
  key: KeyAnimation,
  composite: CompositeAnimation,
  worlds: WorldsAnimation,
};
