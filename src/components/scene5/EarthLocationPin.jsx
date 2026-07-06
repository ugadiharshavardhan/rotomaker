"use client";

import { useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLongToVector3, latLongToNormal } from "@/lib/latLongToVector3";
import { useEarthGlobe } from "./EarthGlobeContext";

export function EarthLocationPin({
  latitude,
  longitude,
  name,
  mapUrl,
  color = "#ffffff",
  index = 0,
  progress = 1,
}) {
  const { surfaceRadius } = useEarthGlobe();
  const groupRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);

  const pinRadius = surfaceRadius * 0.028;
  const glowRadius = surfaceRadius * 0.055;

  const { position, lift } = useMemo(() => {
    const pos = latLongToVector3(latitude, longitude, surfaceRadius);
    const normal = latLongToNormal(latitude, longitude);
    return {
      position: pos,
      lift: normal.multiplyScalar(surfaceRadius * 0.006),
    };
  }, [latitude, longitude, surfaceRadius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 2.4 + index * 1.1) * 0.14;
    const reveal = Math.min(1, progress);

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5 + index) * surfaceRadius * 0.002 * reveal;
    }

    if (glowRef.current) {
      const hoverScale = hovered ? 1.25 : 1;
      glowRef.current.scale.setScalar(pulse * hoverScale * reveal);
      glowRef.current.material.opacity = (hovered ? 0.38 : 0.2 + pulse * 0.06) * reveal;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group position={lift}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (mapUrl && typeof window !== "undefined") {
              window.open(mapUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          <sphereGeometry args={[pinRadius, 20, 20]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>

        <mesh ref={glowRef}>
          <sphereGeometry args={[glowRadius, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[glowRadius * 1.1, glowRadius * 1.55, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.18}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {hovered && (
          <Html
            center
            distanceFactor={8}
            position={[0, glowRadius * 2.2, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="earth-pin-tooltip">{name}</div>
          </Html>
        )}
      </group>
    </group>
  );
}
