"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { latLongToVector3 } from "@/lib/latLongToVector3";
import { useEarthGlobe } from "./EarthGlobeContext";
import { EarthLocationPin } from "./EarthLocationPin";

const PIN_COLORS = {
  India: "#ff8c42",
  "United States": "#5ee7ff",
  Canada: "#c77dff",
};

function GlobeArc({ from, to, progress, radius, index }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const start = latLongToVector3(from.lat, from.lng, radius);
    const end = latLongToVector3(to.lat, to.lng, radius);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(radius * 1.06);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
  }, [from, to, radius]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity =
      (0.12 + progress * 0.32 + Math.sin(state.clock.elapsedTime * 1.4 + index) * 0.06) *
      Math.min(1, progress);
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

export function EarthPinLayer({ locations, progress = 1 }) {
  const { surfaceRadius } = useEarthGlobe();

  const arcs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        pairs.push([locations[i], locations[j]]);
      }
    }
    return pairs;
  }, [locations]);

  return (
    <>
      {locations.map((loc, index) => (
        <EarthLocationPin
          key={loc.name}
          latitude={loc.lat}
          longitude={loc.lng}
          name={loc.name}
          mapUrl={loc.mapUrl}
          color={PIN_COLORS[loc.name] ?? "#ffffff"}
          index={index}
          progress={progress}
        />
      ))}
      {arcs.map(([from, to], i) => (
        <GlobeArc
          key={`${from.name}-${to.name}`}
          from={from}
          to={to}
          progress={progress}
          radius={surfaceRadius}
          index={i}
        />
      ))}
    </>
  );
}
