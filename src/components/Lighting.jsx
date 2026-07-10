"use client";

import { Environment, ContactShadows } from "@react-three/drei";

export function Lighting({ intensity = 1, variant = "dark", compact = false }) {
  const isStudio = variant === "studio";
  const bg = isStudio ? "#e8e9ec" : "#030303";

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, compact ? 18 : 12, compact ? 34 : 28]} />

      <Environment preset="studio" environmentIntensity={(isStudio ? 0.55 : 0.32) * intensity} />

      <ambientLight intensity={(isStudio ? 0.62 : 0.35) * intensity} />

      <directionalLight
        position={[4, 8, 6]}
        intensity={2.4 * intensity}
        castShadow={!compact}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />

      <directionalLight
        position={[-6, 4, 4]}
        intensity={1.1 * intensity}
        color="#e8eeff"
      />

      <spotLight
        position={[0, 9, 2]}
        angle={0.55}
        penumbra={0.9}
        intensity={3 * intensity}
        color="#ffffff"
        castShadow={!compact}
        distance={30}
      />

      <pointLight position={[0, 1.5, 4]} intensity={1.2 * intensity} color="#ffffff" />

      {!compact && (
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.55 * intensity}
          scale={14}
          blur={2.2}
          far={10}
          color="#000000"
        />
      )}
    </>
  );
}
