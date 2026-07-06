"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function FocusedPortfolioCard({ texture, segmentProgress, opacity = 1 }) {
  const ref = useRef();
  const frameMat = useRef();
  const edgeMat = useRef();
  const posterMat = useRef();
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1.42, 0.06)), []);
  const scrollRef = useRef({ segmentProgress, opacity });
  scrollRef.current = { segmentProgress, opacity };

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const { segmentProgress: seg, opacity: op } = scrollRef.current;
    const enter = Math.min(1, seg / 0.35);
    const scale = THREE.MathUtils.lerp(1.05, 1.55, enter) * op;
    const y = Math.sin(t * 0.35) * 0.03;

    ref.current.position.y = y;
    ref.current.rotation.y = Math.sin(t * 0.25) * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.02;
    ref.current.scale.setScalar(scale);

    if (frameMat.current) frameMat.current.opacity = 0.35 + enter * 0.6;
    if (edgeMat.current) edgeMat.current.opacity = 0.2 + enter * 0.45;
    if (posterMat.current) posterMat.current.opacity = enter;
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
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
