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

/**
 * True color standee.
 * Finale: sample upper half of texture only (waist-up busts).
 */
const charFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uReveal;
  uniform float uOpacity;
  uniform float uFinale;

  void main() {
    vec2 uv = vUv;
    // Finale lineup — only the upper half of each image
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

    // Soft fade at bottom edge of finale busts
    float bottomFade = uFinale > 0.5 ? smoothstep(0.0, 0.12, vUv.y) : 1.0;

    vec3 lit = tex.rgb * 1.08;
    lit = min(lit, vec3(1.0));

    gl_FragColor = vec4(lit, tex.a * mask * uOpacity * bottomFade);
  }
`;

const HERO_SCALE = [3.45, 5.1, 1];
/** Tall half-body busts anchored to the bottom of the frame */
const FINALE_SCALE = [4.35, 6.4, 1];
const FINALE_SPACING = 3.15;
const FINALE_Y = -2.55;
const FINALE_Z = -4.6;

/**
 * Large hero standee with true colors.
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
  const texture = useTexture(character.image);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  const sideSign = character.side === "right" ? 1 : -1;

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uReveal: { value: 0 },
      uOpacity: { value: 1 },
      uFinale: { value: finale ? 1 : 0 },
    }),
    [texture, finale]
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

    if (finale) {
      const startX = -((finaleCount - 1) * FINALE_SPACING) / 2;
      const x = startX + finaleIndex * FINALE_SPACING;
      // Bottom-anchored half portraits — taller, flush toward bottom of view
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
  });

  return (
    <group ref={group} visible={false}>
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
          <pointLight
            position={[-sideSign * 1.4, 1.4, 1.0]}
            intensity={0.7}
            distance={5}
            color="#ffffff"
          />
          <pointLight
            position={[sideSign * 1.1, 0.4, 0.8]}
            intensity={0.45}
            distance={4}
            color="#ffffff"
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

  // Keep mounted for the whole beat so the eyes→body shader reveal can play
  if (!character) return null;

  return (
    <HeroCharacter
      key={character.id}
      character={character}
      bodyReveal={bodyReveal}
    />
  );
}
