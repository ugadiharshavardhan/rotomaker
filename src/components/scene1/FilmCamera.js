"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function FilmCamera({ progress, explosionProgress }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const opacity = Math.max(0, 1 - explosionProgress * 2.5);
    const scale = 1 + explosionProgress * 0.12;
    groupRef.current.scale.setScalar(scale);
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = opacity;
        child.material.transparent = opacity < 1;
      }
    });
  });

  const rotationY = progress * Math.PI * 0.8;

  return (
    <group ref={groupRef} rotation={[0, rotationY, 0]} position={[0, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 1.4, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.0, 0.15, 0.75]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.7, 1.2, 32]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.95} roughness={0.15} />
      </mesh>

      <mesh position={[0, 0, 1.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.08, 32]} />
        <meshStandardMaterial
          color="#cccccc"
          emissive="#ffffff"
          emissiveIntensity={0.08 + progress * 0.12}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0.6, 1.1, -0.1]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.5]} />
        <meshStandardMaterial color="#141414" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[-1.0, 0.3, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.25, 24]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.35} />
      </mesh>

      <mesh position={[1.0, 0.3, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.25, 24]} />
        <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.35} />
      </mesh>

      <mesh position={[0, -0.55, 0.46]}>
        <boxGeometry args={[1.8, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#888888"
          emissive="#ffffff"
          emissiveIntensity={0.06}
        />
      </mesh>
    </group>
  );
}

export function LensFlareLight({ intensity = 1 }) {
  return (
    <>
      <pointLight
        position={[3, 2, 4]}
        intensity={intensity * 1.2}
        color="#ffffff"
        distance={20}
      />
      <pointLight
        position={[-4, -1, 2]}
        intensity={intensity * 0.4}
        color="#ffffff"
        distance={15}
      />
    </>
  );
}
