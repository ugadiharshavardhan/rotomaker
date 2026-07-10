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

  const markerRadius = surfaceRadius * 0.032;

  const { surfacePoint, normal, labelOffset, surfaceQuat } = useMemo(() => {
    const n = latLongToNormal(latitude, longitude);
    const point = latLongToVector3(latitude, longitude, surfaceRadius);
    return {
      surfacePoint: point,
      normal: n,
      labelOffset: n.clone().multiplyScalar(surfaceRadius * 0.09),
      surfaceQuat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n),
    };
  }, [latitude, longitude, surfaceRadius]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Keep pins readable once the globe is in view — don't wait for full approach
    const reveal = Math.min(1, Math.max(0, (progress - 0.08) / 0.35));
    const floatAmount = Math.sin(t * 1.4 + index * 0.9) * surfaceRadius * 0.0025 * reveal;

    if (groupRef.current) {
      groupRef.current.position.copy(surfacePoint).addScaledVector(normal, floatAmount);
    }

    if (markerRef.current) {
      const pulse = 1 + Math.sin(t * 2.4 + index * 1.1) * 0.1;
      markerRef.current.scale.setScalar(Math.max(0.001, pulse * reveal));
    }

    if (ringRef.current) {
      const ringPulse = 1 + Math.sin(t * 2 + index) * 0.18;
      ringRef.current.scale.setScalar(Math.max(0.001, ringPulse * reveal));
      ringRef.current.material.opacity = (0.22 + Math.sin(t * 3 + index) * 0.08) * reveal;
    }

    if (labelRef.current) {
      labelRef.current.style.opacity = String(Math.min(1, reveal * 1.15));
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
        <sphereGeometry args={[markerRadius, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.98}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ringRef} quaternion={surfaceQuat} renderOrder={14}>
        <ringGeometry args={[markerRadius * 1.7, markerRadius * 2.5, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
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
