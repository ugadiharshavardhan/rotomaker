"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLongToVector3 } from "@/lib/latLongToVector3";

const ARC_COLOR = "#ffffff";
const ARC_SURFACE_LIFT = 1.05;
const ARC_PEAK_LIFT = 1.22;

function buildArcCurve(from, to, radius) {
  const start = latLongToVector3(from.lat, from.lng, radius * ARC_SURFACE_LIFT);
  const end = latLongToVector3(to.lat, to.lng, radius * ARC_SURFACE_LIFT);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius * ARC_PEAK_LIFT);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

export function EarthConnectionArc({ from, to, radius, progress = 1, index = 0 }) {
  const curve = useMemo(() => buildArcCurve(from, to, radius), [from, to, radius]);
  const tubeRef = useRef();

  const tubeRadius = radius * 0.005;

  const { tubeGeometry, tubeMaterial } = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 80, tubeRadius, 10, false);
    const mat = new THREE.MeshBasicMaterial({
      color: ARC_COLOR,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    });
    return { tubeGeometry: geo, tubeMaterial: mat };
  }, [curve, tubeRadius]);

  useFrame((state) => {
    const reveal = Math.min(1, progress);
    if (!tubeRef.current) return;
    tubeRef.current.material.opacity =
      (0.28 + Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.06) * reveal;
  });

  return (
    <mesh ref={tubeRef} geometry={tubeGeometry} material={tubeMaterial} renderOrder={20} />
  );
}
