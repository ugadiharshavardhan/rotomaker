"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { MOVIE_LIBRARY_IMAGES } from "@/lib/moviesData";
import { HERO_CHARACTERS } from "@/lib/heroStory";
import { useSafeTextures, warmTextureUrls } from "@/components/portfolio/useSafeTextures";

const SHARED_PLANE = new THREE.PlaneGeometry(1, 1);
const _obj = new THREE.Object3D();

/** Portrait poster cell — width / height */
const ASPECT = 0.68;

/** Dense cylindrical hall — exact row/column grid, no jitter. */
const RING_DEFS = [
  { radius: 11, rows: 6, speed: 0.01, dir: 1, opacity: 1 },
];

/**
 * Our Movies section posters — same source as the movies library / dome.
 */
export function getFinalePosterUrls() {
  return MOVIE_LIBRARY_IMAGES.length
    ? [...MOVIE_LIBRARY_IMAGES]
    : ["/cards/spiderman.jpg"];
}

export function getFinaleWarmUrls() {
  return getFinalePosterUrls();
}

/**
 * Exact cylindrical tile grid — aligned rows & columns, flush edges, no tilt.
 */
function buildDenseRing(ringIndex, def, texCount) {
  const { radius, rows, opacity } = def;
  const targetH = 2.15;
  const targetW = targetH * ASPECT;
  // Columns chosen so tiles wrap the circle edge-to-edge
  const cols = Math.max(28, Math.round((2 * Math.PI * radius) / targetW));
  const exactW = (2 * Math.PI * radius) / cols;
  const exactH = exactW / ASPECT;
  const rowPitch = exactH;

  const items = [];
  let texCursor = ringIndex * 19;

  for (let row = 0; row < rows; row++) {
    const y = (row - (rows - 1) / 2) * rowPitch;
    for (let col = 0; col < cols; col++) {
      const angle = (col / cols) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius;
      // Face the center — no X/Z tilt so row edges stay level
      const rotY = Math.atan2(x, z) + Math.PI;

      items.push({
        x,
        y,
        z,
        rotY,
        rotX: 0,
        rotZ: 0,
        scaleW: exactW,
        scaleH: exactH,
        tex: texCursor % texCount,
        opacity,
      });
      texCursor += 1;
    }
  }
  return items;
}

function PosterBatch({ texture, items }) {
  const mesh = useRef();
  const count = items.length;

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m || !count) return;
    for (let i = 0; i < count; i++) {
      const item = items[i];
      _obj.position.set(item.x, item.y, item.z);
      _obj.rotation.set(item.rotX, item.rotY, item.rotZ);
      _obj.scale.set(item.scaleW, item.scaleH, 1);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [items, count]);

  if (!count) return null;

  return (
    <instancedMesh
      ref={mesh}
      args={[SHARED_PLANE, undefined, count]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        side={THREE.FrontSide}
        depthWrite
        depthTest
      />
    </instancedMesh>
  );
}

function PosterRing({ def, ringIndex, textures, open }) {
  const group = useRef();
  const texCount = textures.length;
  const items = useMemo(
    () => buildDenseRing(ringIndex, def, texCount),
    [ringIndex, def, texCount]
  );

  const byTex = useMemo(() => {
    const groups = Array.from({ length: texCount }, () => []);
    items.forEach((item) => groups[item.tex].push(item));
    return groups;
  }, [items, texCount]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y =
      state.clock.elapsedTime * def.speed * def.dir;
  });

  const reveal = Math.min(1, Math.max(0, (open - ringIndex * 0.08) / 0.3));

  return (
    <group ref={group} visible={reveal > 0.02}>
      {byTex.map((groupItems, texIndex) => (
        <PosterBatch
          key={texIndex}
          texture={textures[texIndex]}
          items={groupItems}
        />
      ))}
    </group>
  );
}

function CinemaWall({ textures, open }) {
  return (
    <group>
      {RING_DEFS.map((def, i) => (
        <PosterRing
          key={def.radius}
          def={def}
          ringIndex={i}
          textures={textures}
          open={open}
        />
      ))}
    </group>
  );
}

function FinaleSilhouettes({ open = 0 }) {
  const picks = useMemo(
    () => [HERO_CHARACTERS[0], HERO_CHARACTERS[1], HERO_CHARACTERS[2]],
    []
  );
  const textures = useTexture(picks.map((c) => c.image));
  textures.forEach((tex) => {
    if (tex) tex.colorSpace = THREE.SRGBColorSpace;
  });

  const slots = [
    { angle: 1.15, r: 9.6, y: -3.4, s: [2.0, 3.0] },
    { angle: -1.35, r: 9.8, y: -3.5, s: [1.9, 2.9] },
    { angle: 2.55, r: 13.8, y: -3.6, s: [1.8, 2.7] },
  ];

  return (
    <group>
      {picks.map((character, i) => {
        const slot = slots[i];
        const appear = Math.min(1, Math.max(0, (open - 0.3 - i * 0.1) / 0.4));
        if (appear < 0.02) return null;
        const x = Math.sin(slot.angle) * slot.r;
        const z = -Math.cos(slot.angle) * slot.r;
        return (
          <mesh
            key={character.id}
            geometry={SHARED_PLANE}
            position={[x, slot.y, z]}
            rotation={[0, Math.atan2(x, z) + Math.PI, 0]}
            scale={[slot.s[0] * appear, slot.s[1] * appear, 1]}
          >
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={0.2 + appear * 0.15}
              color="#4a4a4a"
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FinaleParticles({ open = 0 }) {
  const dust = useMemo(() => {
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 24;
      pos[i * 3] = Math.sin(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = -Math.cos(angle) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useRef();

  useFrame(() => {
    if (mat.current) mat.current.opacity = 0.05 * (0.35 + open * 0.65);
  });

  return (
    <points geometry={dust} frustumCulled={false}>
      <pointsMaterial
        ref={mat}
        size={0.022}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#a8a498"
        opacity={0.03}
        sizeAttenuation
      />
    </points>
  );
}

function FinaleLights() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[-8, 2, -3]} intensity={0.4} distance={24} color="#4a6288" />
      <pointLight position={[8, 1, -4]} intensity={0.35} distance={22} color="#7a6048" />
    </>
  );
}

function FinalePostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.06}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.95}
        mipmapBlur
      />
      <Noise opacity={0.018} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette eskil offset={0.35} darkness={0.85} />
    </EffectComposer>
  );
}

function FinaleTextures({ children }) {
  const urls = useMemo(() => getFinalePosterUrls(), []);
  const loaded = useSafeTextures(urls);
  const frozen = useRef(null);

  useEffect(() => {
    warmTextureUrls(urls);
  }, [urls]);

  const list = useMemo(() => {
    if (frozen.current) return frozen.current;
    if (!loaded) return null;
    const ready = loaded.filter(Boolean);
    // Freeze once enough Our Movies posters are ready (don't wait forever on slow CDNs)
    const need = Math.min(urls.length, 10);
    if (ready.length < need) return null;
    ready.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 2;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
    frozen.current = ready;
    return ready;
  }, [loaded, urls.length]);

  if (!list?.length) return null;
  return children(list);
}

/**
 * True 360° Wall of Cinema — pre-mountable so the first scroll-in does not hitch.
 */
export function FinaleCinemaWorld({ local = 0, active = true }) {
  const open = active ? Math.min(1, Math.max(0, (local - 0.02) / 0.55)) : 0;
  const eased = open * open * (3 - 2 * open);

  return (
    <group visible={active}>
      {active && <color attach="background" args={["#000000"]} />}
      {active && <fog attach="fog" args={["#000000", 16, 42]} />}
      <FinaleLights />
      {active && <FinaleParticles open={eased} />}

      <FinaleTextures>
        {(textures) => <CinemaWall textures={textures} open={Math.max(eased, 0.001)} />}
      </FinaleTextures>

      {active && (
        <Suspense fallback={null}>
          <FinaleSilhouettes open={eased} />
        </Suspense>
      )}

      {active && eased > 0.12 && <FinalePostFX />}
    </group>
  );
}
