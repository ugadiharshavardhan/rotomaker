"use client";

import {
  Environment,
  ContactShadows,
  Lightformer,
  SpotLight,
} from "@react-three/drei";

function ShadowCatcher() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.8, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <shadowMaterial transparent opacity={0.25} color="#000000" />
    </mesh>
  );
}

export function StudioLighting({ intensity = 1 }) {
  return (
    <>
      <Environment preset="studio" environmentIntensity={0.35 * intensity}>
        <Lightformer
          form="rect"
          intensity={2}
          color="#ffffff"
          scale={[8, 4]}
          position={[0, 5, -5]}
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          color="#ffffff"
          scale={4}
          position={[-5, 3, 2]}
        />
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#ffffff"
          scale={[3, 8]}
          position={[6, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </Environment>

      <ambientLight intensity={0.04 * intensity} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5 * intensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      <SpotLight
        position={[3, 4, 6]}
        angle={0.35}
        penumbra={0.85}
        intensity={40 * intensity}
        color="#ffffff"
        castShadow
        shadow-mapSize={512}
        volumetric={false}
      />

      <spotLight
        position={[-4, 8, 3]}
        angle={0.4}
        penumbra={1}
        intensity={0.6 * intensity}
        color="#ffffff"
        distance={25}
      />

      <ContactShadows
        position={[0, -2.79, 0]}
        opacity={0.35 * intensity}
        scale={25}
        blur={2.8}
        far={12}
        color="#000000"
      />

      <ShadowCatcher />

      <fog attach="fog" args={["#030303", 8, 28]} />
    </>
  );
}
