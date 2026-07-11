"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const charVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const charFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uFinale;

  void main() {
    vec2 uv = vUv;
    if (uFinale > 0.5) {
      uv.y = mix(0.38, 1.0, vUv.y);
    }

    vec4 tex = texture2D(uMap, uv);
    if (tex.a < 0.08) discard;

    float reveal = uFinale > 0.5 ? 1.0 : clamp(uReveal, 0.0, 1.0);
    float edge = mix(1.05, -0.08, reveal);
    float soft = 0.08;
    float mask = smoothstep(edge - soft, edge + soft * 0.3, vUv.y);
    if (mask < 0.02) discard;

    float bottomFade = uFinale > 0.5 ? smoothstep(0.0, 0.12, vUv.y) : 1.0;
    vec3 lit = tex.rgb * 1.2;
    lit = min(lit, vec3(1.0));
    gl_FragColor = vec4(lit, tex.a * mask * uOpacity * bottomFade);
  }
`;

const beamVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Soft animated light shaft — sweeps in with the character reveal. */
const beamFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform float uTime;

  void main() {
    float x = abs(vUv.x - 0.5) * 2.0;
    float y = vUv.y;
    float shaft = pow(1.0 - smoothstep(0.0, 0.55 + y * 0.35, x), 1.6);
    float fall = smoothstep(0.0, 0.12, y) * (1.0 - smoothstep(0.55, 1.0, y));
    float pulse = 0.85 + 0.15 * sin(uTime * 2.2 + y * 4.0);
    float a = shaft * fall * uOpacity * pulse;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const HERO_SCALE = [3.45, 5.1, 1];
const FINALE_SCALE = [4.35, 6.4, 1];
const FINALE_SPACING = 3.15;
const FINALE_Y = -2.55;
const FINALE_Z = -4.6;
const BEAM_GEO = new THREE.PlaneGeometry(1, 1);

/** Soft cone ray — same language as HeroSpotlight3D, driven by character reveal. */
function CharacterVolumetricRay({ from, to, baseOpacity = 0.04, lightInRef }) {
  const ref = useRef();
  const { position, rotation } = useMemo(() => {
    const pos = new THREE.Vector3(...from);
    const target = new THREE.Vector3(...to);
    const dir = target.clone().sub(pos).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      dir
    );
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return {
      position: from,
      rotation: [euler.x, euler.y, euler.z],
    };
  }, [from, to]);

  useFrame((state) => {
    if (!ref.current) return;
    const lightIn = lightInRef?.current ?? 0;
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 1.6) * 0.15;
    ref.current.material.opacity = baseOpacity * lightIn * pulse;
    ref.current.scale.setScalar(0.55 + lightIn * 0.55);
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} renderOrder={9}>
      <coneGeometry args={[1.35, 7.5, 28, 1, true]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Large hero standee — cinematic light shaft animates in with the reveal.
 */
export function HeroCharacter({
  character,
  bodyReveal = 0,
  finale = false,
  finaleIndex = 0,
  finaleCount = 5,
  finaleReveal = 1,
}) {
  const group = useRef();
  const mat = useRef();
  const beamMat = useRef();
  const beamMat2 = useRef();
  const spotRef = useRef();
  const keyRef = useRef();
  const rimRef = useRef();
  const lightInRef = useRef(0);
  const texture = useTexture(character.image);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const sideSign = character.side === "right" ? 1 : -1;
  const cool = character.rimCool || "#a8c4ff";
  const warm = character.rimWarm || "#ffb070";

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
      uFinale: { value: finale ? 1 : 0 },
    }),
    [texture, finale]
  );

  const beamUniforms = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(cool) },
      uTime: { value: 0 },
    }),
    [cool]
  );

  const beamUniforms2 = useMemo(
    () => ({
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color("#ffffff") },
      uTime: { value: 0 },
    }),
    []
  );

  const rayFocus = useMemo(() => [0, 0.2, 0], []);
  const rayKeyFrom = useMemo(
    () => [-sideSign * 2.2, 4.8, 2.4],
    [sideSign]
  );
  const rayRimFrom = useMemo(
    () => [sideSign * 1.6, 3.6, -1.8],
    [sideSign]
  );

  useFrame((state) => {
    const g = group.current;
    const m = mat.current;
    if (!g || !m) return;

    const reveal = finale ? finaleReveal : bodyReveal;
    const visible = reveal > 0.02;
    g.visible = visible;
    if (!visible) return;

    const t = state.clock.elapsedTime;
    const breath = 1 + Math.sin(t * 1.05 + finaleIndex) * 0.008;
    const lightIn = THREE.MathUtils.smoothstep(reveal, 0.05, 0.55);
    lightInRef.current = lightIn;

    if (finale) {
      const startX = -((finaleCount - 1) * FINALE_SPACING) / 2;
      const x = startX + finaleIndex * FINALE_SPACING;
      g.position.set(x, FINALE_Y + Math.sin(t * 0.55 + finaleIndex) * 0.015, FINALE_Z);
      g.scale.set(FINALE_SCALE[0] * breath, FINALE_SCALE[1] * breath, 1);
      g.rotation.y = 0;
    } else {
      const baseX = sideSign * 2.15;
      g.position.set(baseX, 0.45 + Math.sin(t * 0.85) * 0.02, -3.5);
      g.scale.set(HERO_SCALE[0] * breath, HERO_SCALE[1] * breath, 1);
      g.rotation.y = -sideSign * 0.06;
    }

    m.uniforms.uReveal.value = reveal;
    m.uniforms.uFinale.value = finale ? 1 : 0;
    m.uniforms.uMap.value = texture;
    m.uniforms.uOpacity.value = finale ? Math.min(1, finaleReveal) : 1;

    const pulse = 0.9 + Math.sin(t * 2.1) * 0.1;
    if (beamMat.current) {
      beamMat.current.uniforms.uOpacity.value = lightIn * 0.62 * pulse;
      beamMat.current.uniforms.uTime.value = t;
      beamMat.current.uniforms.uColor.value.set(cool);
    }
    if (beamMat2.current) {
      beamMat2.current.uniforms.uOpacity.value = lightIn * 0.38 * pulse;
      beamMat2.current.uniforms.uTime.value = t + 1.2;
      beamMat2.current.uniforms.uColor.value.set("#ffffff");
    }
    if (spotRef.current) {
      spotRef.current.intensity = lightIn * (6.2 + Math.sin(t * 1.8) * 0.7);
      spotRef.current.penumbra = 0.55 + (1 - lightIn) * 0.3;
    }
    if (keyRef.current) {
      keyRef.current.intensity = lightIn * (1.9 + Math.sin(t * 1.4) * 0.2);
    }
    if (rimRef.current) {
      rimRef.current.intensity = lightIn * (2.8 + Math.sin(t * 2.4 + 1) * 0.3);
    }
  });

  return (
    <group ref={group} visible={false}>
      {/* Lighting animation — shafts + cones rise with the body reveal */}
      {!finale && (
        <>
          <CharacterVolumetricRay
            from={rayKeyFrom}
            to={rayFocus}
            baseOpacity={0.055}
            lightInRef={lightInRef}
          />
          <CharacterVolumetricRay
            from={rayRimFrom}
            to={rayFocus}
            baseOpacity={0.035}
            lightInRef={lightInRef}
          />
          <mesh
            geometry={BEAM_GEO}
            position={[-sideSign * 0.1, 1.25, -0.45]}
            rotation={[0.1, 0, sideSign * 0.16]}
            scale={[1.55, 3.7, 1]}
            renderOrder={10}
          >
            <shaderMaterial
              ref={beamMat}
              transparent
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
              vertexShader={beamVert}
              fragmentShader={beamFrag}
              uniforms={beamUniforms}
            />
          </mesh>
          <mesh
            geometry={BEAM_GEO}
            position={[sideSign * 0.35, 0.85, -0.7]}
            rotation={[-0.08, 0, -sideSign * 0.22]}
            scale={[0.95, 2.8, 1]}
            renderOrder={10}
          >
            <shaderMaterial
              ref={beamMat2}
              transparent
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
              vertexShader={beamVert}
              fragmentShader={beamFrag}
              uniforms={beamUniforms2}
            />
          </mesh>
        </>
      )}

      <mesh renderOrder={15}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={mat}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.DoubleSide}
          toneMapped={false}
          vertexShader={charVert}
          fragmentShader={charFrag}
          uniforms={uniforms}
        />
      </mesh>

      {!finale && (
        <>
          <spotLight
            ref={spotRef}
            position={[-sideSign * 0.35, 3.4, 1.8]}
            angle={0.38}
            penumbra={0.7}
            intensity={0}
            distance={14}
            color="#ffffff"
            castShadow={false}
          />
          <pointLight
            ref={keyRef}
            position={[-sideSign * 1.2, 1.7, 1.4]}
            intensity={0}
            distance={7}
            color="#ffffff"
          />
          <pointLight
            ref={rimRef}
            position={[sideSign * 0.4, 1.05, -1.55]}
            intensity={0}
            distance={6.5}
            color={cool}
          />
          <pointLight
            position={[sideSign * 1.15, 0.4, 0.95]}
            intensity={0.4}
            distance={4.8}
            color={warm}
          />
        </>
      )}
    </group>
  );
}

export function HeroCharacterLayer({
  characters,
  characterIndex,
  bodyReveal,
  finale = false,
  finaleLocal = 0,
}) {
  if (finale) {
    return (
      <group>
        {characters.map((character, index) => {
          const stagger = index * 0.07;
          const reveal = Math.min(1, Math.max(0, (finaleLocal - 0.06 - stagger) / 0.25));
          if (reveal <= 0.01) return null;
          return (
            <HeroCharacter
              key={`finale-${character.id}`}
              character={character}
              finale
              finaleIndex={index}
              finaleCount={characters.length}
              finaleReveal={reveal}
            />
          );
        })}
      </group>
    );
  }

  const character =
    characterIndex >= 0 && characterIndex < characters.length
      ? characters[characterIndex]
      : null;

  if (!character) return null;

  return (
    <HeroCharacter
      key={character.id}
      character={character}
      bodyReveal={bodyReveal}
    />
  );
}
