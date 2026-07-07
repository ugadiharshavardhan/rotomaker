"use client";

import { useMemo, useRef } from "react";
import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLongToVector3, latLongToNormal } from "@/lib/latLongToVector3";
import { useEarthGlobe } from "./EarthGlobeContext";

export function EarthLocationPin({
  latitude,
  longitude,
  name,
  mapUrl,
  color = "#c77dff",
  index = 0,
  progress = 1,
}) {
  const { surfaceRadius } = useEarthGlobe();
  const groupRef = useRef();
  const markerRef = useRef();
  const ringRef = useRef();
  const labelRef = useRef();

  const markerRadius = surfaceRadius * 0.028;

  const { surfacePoint, normal, labelOffset } = useMemo(() => {
    const n = latLongToNormal(latitude, longitude);
    const point = latLongToVector3(latitude, longitude, surfaceRadius);
    return {
      surfacePoint: point,
      normal: n,
      labelOffset: n.clone().multiplyScalar(surfaceRadius * 0.08),
    };
  }, [latitude, longitude, surfaceRadius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const reveal = Math.min(1, progress);
    const floatAmount = Math.sin(t * 1.4 + index * 0.9) * surfaceRadius * 0.002 * reveal;

    if (groupRef.current) {
      groupRef.current.position.copy(surfacePoint).addScaledVector(normal, floatAmount);
    }

    if (markerRef.current) {
      const pulse = 1 + Math.sin(t * 2.4 + index * 1.1) * 0.12;
      markerRef.current.scale.setScalar(pulse * reveal);
    }

    if (ringRef.current) {
      const ringPulse = 1 + Math.sin(t * 2 + index) * 0.2;
      ringRef.current.scale.setScalar(ringPulse);
      ringRef.current.material.opacity = (0.18 + Math.sin(t * 3 + index) * 0.08) * reveal;
      ringRef.current.rotation.z = t * 0.4 + index;
    }

    if (labelRef.current) {
      labelRef.current.style.opacity = String(Math.min(1, reveal * 1.2));
      labelRef.current.style.transform = `translateY(${Math.sin(t * 1.8 + index) * 3}px)`;
    }
  });

  return (
    <group ref={groupRef} position={surfacePoint} renderOrder={15}>
      <mesh
        ref={markerRef}
        onClick={(e) => {
          e.stopPropagation();
          if (mapUrl && typeof window !== "undefined") {
            window.open(mapUrl, "_blank", "noopener,noreferrer");
          }
        }}
      >
        <sphereGeometry args={[markerRadius, 20, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={14}>
        <ringGeometry args={[markerRadius * 1.8, markerRadius * 2.6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Billboard position={labelOffset} follow>
        <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <span ref={labelRef} className="globe-pin-label globe-pin-label--earth">
            {name}
          </span>
        </Html>
      </Billboard>
    </group>
  );
}
