"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

function FloatingMonitor({ position, rotation, lightLevel }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.06;
    ref.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.8, 1.1, 0.06]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#ffffff"
          emissiveIntensity={0.05 + lightLevel * 0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04 + lightLevel * 0.15}
        />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#141414" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function DeskSilhouette({ position, lightLevel }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <meshStandardMaterial
          color="#050505"
          emissive="#ffffff"
          emissiveIntensity={lightLevel * 0.08}
        />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}

function CeilingLight({ position, lightLevel }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.06, 0.4]} />
        <meshStandardMaterial
          color="#111"
          emissive="#ffffff"
          emissiveIntensity={lightLevel * 0.8}
        />
      </mesh>
      <pointLight
        position={[0, -0.5, 0]}
        intensity={lightLevel * 1.5}
        color="#ffffff"
        distance={8}
      />
    </group>
  );
}

export function Scene11World({ progress, opacity = 1 }) {
  const groupRef = useRef();
  const lightLevel = Math.min(1, progress / 0.5);
  const reveal = Math.min(1, progress / 0.2);

  const monitors = useMemo(
    () => [
      { position: [-3, 1.5, -1], rotation: [0, 0.3, 0] },
      { position: [3.5, 0.8, 0.5], rotation: [0, -0.4, 0] },
      { position: [-1, 2.2, 1], rotation: [0, 0.1, 0.05] },
      { position: [2, 2.5, -0.5], rotation: [0, -0.2, -0.03] },
    ],
    []
  );

  const desks = useMemo(
    () => [
      [-2.5, -1.5, 0],
      [0, -1.8, 0.5],
      [2.5, -1.5, -0.3],
      [-1, -1.6, 1],
    ],
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.08 * reveal;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef} scale={reveal}>
      <ambientLight intensity={(0.02 + lightLevel * 0.08) * opacity} />
      <directionalLight position={[0, 8, 5]} intensity={lightLevel * 0.4 * opacity} />

      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#080808" metalness={0.3} roughness={0.8} />
      </mesh>

      <CeilingLight position={[-3, 4, 0]} lightLevel={lightLevel} />
      <CeilingLight position={[0, 4, 0]} lightLevel={lightLevel} />
      <CeilingLight position={[3, 4, 0]} lightLevel={lightLevel} />

      {desks.map((pos, i) => (
        <DeskSilhouette key={i} position={pos} lightLevel={lightLevel} />
      ))}

      {monitors.map((m, i) => (
        <FloatingMonitor
          key={i}
          position={m.position}
          rotation={m.rotation}
          lightLevel={lightLevel}
        />
      ))}
    </group>
  );
}
