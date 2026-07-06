"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PIPELINE_STEPS } from "@/lib/experienceData";

function WorkflowNode({ position, label, index, progress, total }) {
  const ref = useRef();
  const nodeProgress = Math.max(0, Math.min(1, (progress * total - index) / 1.5));

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.04 * nodeProgress;
    ref.current.scale.setScalar(0.5 + nodeProgress * 0.5);
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive="#ffffff"
          emissiveIntensity={0.2 + nodeProgress * 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15 + nodeProgress * 0.35} />
      </mesh>
    </group>
  );
}

function WorkflowArc({ from, to, progress, index }) {
  const ref = useRef();
  const lineProgress = Math.max(0, Math.min(1, progress * PIPELINE_STEPS.length - index - 0.5));

  const geometry = useMemo(() => {
    const mid = new THREE.Vector3(
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.5,
      (from[2] + to[2]) / 2
    );
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      mid,
      new THREE.Vector3(...to)
    );
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
  }, [from, to]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity =
      0.1 + lineProgress * 0.4 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
    </line>
  );
}

export function Scene10World({ progress, opacity = 1 }) {
  const groupRef = useRef();
  const reveal = Math.min(1, progress / 0.25);
  const count = PIPELINE_STEPS.length;
  const radius = 4.5;

  const nodes = useMemo(() => {
    return PIPELINE_STEPS.map((label, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return {
        label,
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.6,
          Math.sin(angle) * 1.5,
        ],
        index: i,
      };
    });
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05 * reveal;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef} scale={reveal}>
      <ambientLight intensity={0.06 * opacity} />
      <pointLight position={[0, 0, 8]} intensity={1.2 * opacity} color="#ffffff" />

      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % count];
        return (
          <WorkflowArc
            key={`arc-${i}`}
            from={node.position}
            to={next.position}
            progress={progress}
            index={i}
          />
        );
      })}

      {nodes.map((node) => (
        <WorkflowNode
          key={node.label}
          position={node.position}
          label={node.label}
          index={node.index}
          progress={progress}
          total={count}
        />
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.015, 8, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08 + progress * 0.12} />
      </mesh>
    </group>
  );
}
