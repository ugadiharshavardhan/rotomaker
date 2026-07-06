"use client";

import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLOBE_LOCATIONS } from "@/lib/sceneConfig";
import { GLOBE_MODEL_RADIUS, getGlobeLayout } from "@/lib/globeModelPath";
import { latLongToVector3 } from "@/lib/latLongToVector3";

const GLOBE_APPROACH_END = 0.38;
const GLOBE_LOCKED_SCALE = 0.92;
const GLOBE_FAR_SCALE = 0.28;

function smoothstep(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

function getGlobeApproach(progress) {
  return smoothstep(progress / GLOBE_APPROACH_END);
}

const MARKER_RADIUS = GLOBE_MODEL_RADIUS * 1.003;

function useResponsiveGlobeScale() {
  const { size } = useThree();
  if (size.width < 480) return 0.58;
  if (size.width < 768) return 0.72;
  if (size.width < 1100) return 0.9;
  return 1.05;
}

function GlobeArc({ from, to, progress, index }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const start = latLongToVector3(from.lat, from.lng, MARKER_RADIUS);
    const end = latLongToVector3(to.lat, to.lng, MARKER_RADIUS);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(GLOBE_MODEL_RADIUS * 1.06);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(56));
  }, [from, to]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity =
      0.1 + progress * 0.35 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.08;
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.25} blending={THREE.AdditiveBlending} />
    </line>
  );
}

function LocationMarker({ latitude, longitude, progress, index, color = "#ffffff", name }) {
  const groupRef = useRef();
  const position = useMemo(
    () => latLongToVector3(latitude, longitude, MARKER_RADIUS),
    [latitude, longitude]
  );
  const labelOffset = useMemo(
    () => position.clone().normalize().multiplyScalar(0.22),
    [position]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.04;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.14 + progress * 0.2} toneMapped={false} />
      </mesh>
      <Html
        position={labelOffset}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <span className="globe-pin-label" style={{ opacity: progress }}>
          {name}
        </span>
      </Html>
    </group>
  );
}

function ProceduralGlobe({ progress, children }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[GLOBE_MODEL_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} metalness={0.05} />
      </mesh>
      <mesh scale={1.002}>
        <sphereGeometry args={[GLOBE_MODEL_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1 + progress * 0.06} />
      </mesh>
      {children}
    </group>
  );
}

function GlobeMarkers({ progress }) {
  const markerColors = ["#ff8c42", "#ffffff", "#c77dff"];
  const arcs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < GLOBE_LOCATIONS.length; i++) {
      for (let j = i + 1; j < GLOBE_LOCATIONS.length; j++) {
        pairs.push([GLOBE_LOCATIONS[i], GLOBE_LOCATIONS[j]]);
      }
    }
    return pairs;
  }, []);

  return (
    <>
      {GLOBE_LOCATIONS.map((loc, i) => (
        <LocationMarker
          key={loc.name}
          latitude={loc.lat}
          longitude={loc.lng}
          progress={progress}
          index={i}
          color={markerColors[i]}
          name={loc.name}
        />
      ))}
      {arcs.map(([from, to], i) => (
        <GlobeArc key={`${from.name}-${to.name}`} from={from} to={to} progress={progress} index={i} />
      ))}
    </>
  );
}

function FullPageStarfield({ progress, opacity = 1 }) {
  const ref = useRef();
  const count = 420;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 48;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 36 - 4;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        color="#ffffff"
        transparent
        opacity={(0.12 + progress * 0.28) * opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Scene5World({ progress, opacity = 1 }) {
  const globeRef = useRef();
  const maxProgressRef = useRef(0);

  if (opacity <= 0) {
    maxProgressRef.current = 0;
  } else {
    maxProgressRef.current = Math.max(maxProgressRef.current, progress);
  }

  const approach = getGlobeApproach(maxProgressRef.current);
  const scaleFactor = GLOBE_FAR_SCALE + approach * (GLOBE_LOCKED_SCALE - GLOBE_FAR_SCALE);
  const globeDepth = -3.2 + approach * 3.2;
  const responsiveScale = useResponsiveGlobeScale();
  const { size } = useThree();
  const globeLayout = getGlobeLayout(size.width);
  const globeX = globeLayout.worldX * approach;

  useFrame((state) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y = state.clock.elapsedTime * 0.1 + progress * 0.35;
  });

  if (opacity <= 0) return null;

  return (
    <>
      <FullPageStarfield progress={approach} opacity={opacity} />

      <group
        scale={scaleFactor * responsiveScale}
        position={[globeX, 0, globeDepth]}
      >
        <ambientLight intensity={0.22 * opacity} />
        <directionalLight position={[6, 4, 6]} intensity={1.35 * opacity} color="#ffffff" />
        <directionalLight position={[-5, -1, -4]} intensity={0.18 * opacity} color="#446688" />

        <group ref={globeRef}>
          <ProceduralGlobe progress={approach}>
            <GlobeMarkers progress={approach} />
          </ProceduralGlobe>
        </group>
      </group>
    </>
  );
}
