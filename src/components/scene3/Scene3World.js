"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";

const NODES = [
  { id: "comp", pos: [0, 0, 0], label: "COMP" },
  { id: "track", pos: [-3.2, 1.4, -0.8], label: "TRACK" },
  { id: "key", pos: [3.0, 1.0, 0.4], label: "KEY" },
  { id: "paint", pos: [-2.3, -1.6, 1.2], label: "PAINT" },
  { id: "roto", pos: [2.6, -1.3, -1], label: "ROTO" },
  { id: "render", pos: [0, 2.5, -1.8], label: "OUT" },
];

const CONNECTIONS = [
  ["track", "comp"],
  ["key", "comp"],
  ["paint", "comp"],
  ["roto", "comp"],
  ["comp", "render"],
  ["track", "key"],
];

function CentralSlate({ progress }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[2.2, 3.2, 0.12]} />
        <meshPhysicalMaterial
          color="#181818"
          metalness={0.7}
          roughness={0.35}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[1.9, 2.8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03 + progress * 0.04} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 3.2, 0.12)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15 + progress * 0.15} />
      </lineSegments>
    </group>
  );
}

function PipelineNode({ position, label, progress, index }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 0.45 + index) * 0.08 * progress;
    ref.current.rotation.y = t * 0.12 + progress * 0.3;
  });

  return (
    <group ref={ref} position={position} scale={0.55 + progress * 0.2}>
      <mesh>
        <boxGeometry args={[1.6, 1, 0.1]} />
        <meshPhysicalMaterial
          color="#111111"
          emissive="#ffffff"
          emissiveIntensity={0.04 + progress * 0.08}
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.4, 0.75]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06 + progress * 0.08} />
      </mesh>
      <mesh position={[0.65, 0.4, 0.1]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6 + progress * 0.3} />
      </mesh>
    </group>
  );
}

function ConnectionLine({ from, to, progress, nodeMap }) {
  const fromPos = nodeMap[from];
  const toPos = nodeMap[to];

  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(
        (fromPos[0] + toPos[0]) / 2,
        (fromPos[1] + toPos[1]) / 2 + 0.9,
        (fromPos[2] + toPos[2]) / 2
      ),
      new THREE.Vector3(...toPos)
    );
    return curve.getPoints(40).map((p) => [p.x, p.y, p.z]);
  }, [fromPos, toPos]);

  return (
    <Line
      points={points}
      color="#ffffff"
      transparent
      opacity={0.18 + progress * 0.38}
      lineWidth={1}
      dashed
      dashSize={0.15}
      gapSize={0.1}
    />
  );
}

function FloatingCamera({ position, progress, index }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.25 + progress * index;
    ref.current.position.y = position[1] + Math.sin(t * 0.55 + index) * 0.15;
  });

  return (
    <group ref={ref} position={position} scale={0.45 + progress * 0.1}>
      <mesh>
        <boxGeometry args={[2, 1.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.7, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function FilmReel({ position, progress, index }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.35 * progress + index;
  });

  return (
    <group ref={ref} position={position} scale={0.7}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 24]} />
        <meshStandardMaterial color="#222" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.035, 8, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35 + progress * 0.25} />
      </mesh>
    </group>
  );
}

function GridFloor({ progress }) {
  return (
    <gridHelper args={[22, 22, "#333333", "#111111"]} position={[0, -2.8, 0]} />
  );
}

export function Scene3World({ progress, opacity = 1 }) {
  const groupRef = useRef();
  const nodeMap = useMemo(
    () => Object.fromEntries(NODES.map((n) => [n.id, n.pos])),
    []
  );
  const reveal = Math.min(1, progress / 0.35);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = progress * Math.PI * 0.55 + t * 0.025 * reveal;
    groupRef.current.position.y = -0.4 + reveal * 0.4;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={groupRef} scale={0.85 + reveal * 0.15}>
      <ambientLight intensity={0.1 * opacity} />
      <pointLight position={[0, 4, 6]} intensity={1.4 * opacity} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={0.4 * opacity} />
      <pointLight position={[-4, 2, -2]} intensity={0.5 * opacity} color="#888888" />

      <GridFloor progress={reveal} />

      <CentralSlate progress={reveal} />

      {CONNECTIONS.map(([from, to]) => (
        <ConnectionLine
          key={`${from}-${to}`}
          from={from}
          to={to}
          progress={reveal}
          nodeMap={nodeMap}
        />
      ))}

      {NODES.map((node, i) => (
        <PipelineNode
          key={node.id}
          position={node.pos}
          label={node.label}
          progress={reveal}
          index={i}
        />
      ))}

      <FloatingCamera position={[-5, 0.3, 2]} progress={reveal} index={0} />
      <FloatingCamera position={[5.2, -0.4, 1.2]} progress={reveal} index={1} />
      <FilmReel position={[-4, -2.2, -0.8]} progress={reveal} index={0} />
      <FilmReel position={[4.2, 1.8, -1.2]} progress={reveal} index={1} />
    </group>
  );
}
