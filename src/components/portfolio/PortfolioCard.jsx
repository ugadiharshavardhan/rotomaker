"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function PortfolioCard({
  texture,
  index,
  total,
  progress,
  opacity,
  activeIndex,
  segmentProgress,
}) {
  const ref = useRef();
  const frameMat = useRef();
  const edgeMat = useRef();
  const posterMat = useRef();
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1.42, 0.06)), []);
  const scrollRef = useRef({ progress, activeIndex, segmentProgress });
  scrollRef.current = { progress, activeIndex, segmentProgress };

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const { activeIndex: active, segmentProgress: seg } = scrollRef.current;
    const activeAngle = (active / total) * Math.PI * 2;
    const angle = (index / total) * Math.PI * 2 + t * 0.05;

    let radius = 3.2;
    let y = Math.sin(angle * 2 + index * 0.7) * 0.25 + Math.sin(t * 0.45 + index) * 0.06;
    let cardOpacity = 0.2;
    let scale = 0.65;

    if (index === active) {
      radius = THREE.MathUtils.lerp(1.85, 1.05, seg);
      y = THREE.MathUtils.lerp(0, 0.08, seg) + Math.sin(t * 0.4) * 0.04;
      cardOpacity = 1;
      scale = THREE.MathUtils.lerp(1.15, 1.65, seg);
    } else if (
      index === (active + 1) % total ||
      index === (active - 1 + total) % total
    ) {
      radius = 3.8;
      cardOpacity = 0.32;
      scale = 0.72;
    }

    const offset = angle - activeAngle - t * 0.05;
    ref.current.position.x = Math.sin(offset) * radius;
    ref.current.position.z = Math.cos(offset) * radius - 1.5;
    ref.current.position.y = y;
    ref.current.rotation.y = Math.sin(offset) * 0.35;
    ref.current.rotation.x = Math.sin(t * 0.3 + index) * 0.04;
    ref.current.scale.setScalar(scale * opacity);

    if (frameMat.current) frameMat.current.opacity = 0.35 + cardOpacity * 0.6;
    if (edgeMat.current) edgeMat.current.opacity = 0.2 + cardOpacity * 0.45;
    if (posterMat.current) posterMat.current.opacity = cardOpacity;
  });

  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[1, 1.42, 0.06]} />
        <meshPhysicalMaterial
          ref={frameMat}
          color="#080808"
          transparent
          opacity={0.92}
          metalness={0.6}
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.9, 1.28]} />
        {texture ? (
          <meshBasicMaterial ref={posterMat} map={texture} toneMapped={false} transparent />
        ) : (
          <meshBasicMaterial ref={posterMat} color="#141414" transparent opacity={0.85} />
        )}
      </mesh>
      <lineSegments geometry={edges} scale={[1, 1.42, 0.06]}>
        <lineBasicMaterial ref={edgeMat} color="#ffffff" transparent opacity={0.45} />
      </lineSegments>
      {[
        [-0.44, 0.62],
        [0.44, 0.62],
        [-0.44, -0.62],
        [0.44, -0.62],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, 0.04]}>
          <mesh position={[0, 0.07, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
          </mesh>
          <mesh position={[0.07, 0, 0]}>
            <boxGeometry args={[0.14, 0.02, 0.01]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
