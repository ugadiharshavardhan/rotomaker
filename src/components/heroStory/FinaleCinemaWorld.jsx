"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";
import { HERO_CHARACTERS } from "@/lib/heroStory";
import { useSafeTextures, warmTextureUrls } from "@/components/portfolio/useSafeTextures";

const SHARED_PLANE = new THREE.PlaneGeometry(1, 1);
const _obj = new THREE.Object3D();

/** Portrait poster cell — width / height */
const ASPECT = 0.68;

/** Single cylindrical hall — extra rings caused a ghost wall behind the first. */
const RING_DEFS = [
  { radius: 11, rows: 6, speed: 0.01, dir: 1, opacity: 1, gap: 0.035 },
];

function hash01(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Every unique poster in the app — local cards + full movie library. */
export function getFinalePosterUrls() {
  const library = MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
    category.movies.map((movie) => movie.image).filter(Boolean)
  );
  const seen = new Set();
  const urls = [];
  for (const url of [...MOVIE_IMAGES, ...library]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls.length ? urls : ["/cards/spiderman.jpg"];
}

/**
 * Neat cylindrical tile grid — full 360°, stacked rows, almost no gaps.
 */
function buildDenseRing(ringIndex, def, texCount) {
  const { radius, rows, gap, opacity } = def;
  const cellH = 2.15;
  const cellW = cellH * ASPECT;
  const cols = Math.max(28, Math.round((2 * Math.PI * radius) / (cellW + gap)));
  const exactW = (2 * Math.PI * radius) / cols - gap;
  const exactH = exactW / ASPECT;
  const rowPitch = exactH + gap;

  const items = [];
  let texCursor = ringIndex * 19;

  for (let row = 0; row < rows; row++) {
    const y = (row - (rows - 1) / 2) * rowPitch;
    for (let col = 0; col < cols; col++) {
      const seed = ringIndex * 1009 + row * 131 + col * 17;
      const h = hash01(seed);
      const h2 = hash01(seed + 3.1);

      const angle = (col / cols) * Math.PI * 2;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius;
      const rotY = Math.atan2(x, z) + Math.PI;

      const hero = col % 12 === 0 && (row === 2 || row === 3);
      const scaleMul = hero ? 1.28 : 1;

      items.push({
        x,
        y: y + (h - 0.5) * 0.03,
        z,
        rotY,
        rotX: (h - 0.5) * 0.02,
        rotZ: (h2 - 0.5) * 0.02,
        scaleW: exactW * scaleMul,
        scaleH: exactH * scaleMul,
        tex: texCursor % texCount,
        opacity,
      });
      texCursor += 1;
    }
  }
  return items;
}

function PosterBatch({ texture, items, opacity }) {
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
      visible={opacity > 0.02}
    >
      {/* Opaque JPGs — transparency let the far side of the cylinder ghost through */}
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
  const ringOpacity = def.opacity * Math.min(1, 0.35 + open * 0.65) * reveal;
  if (reveal < 0.02) return null;

  return (
    <group ref={group}>
      {byTex.map((groupItems, texIndex) => (
        <PosterBatch
          key={texIndex}
          texture={textures[texIndex]}
          items={groupItems}
          opacity={ringOpacity}
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
  // Progressive, non-suspending — a dead remote poster must not blank the wall
  const loaded = useSafeTextures(urls);

  useEffect(() => {
    warmTextureUrls(urls);
  }, [urls]);

  const list = useMemo(() => {
    if (!loaded) return null;
    const ready = loaded.filter(Boolean);
    if (!ready.length) return null;
    ready.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
    return ready;
  }, [loaded]);

  if (!list?.length) return null;
  return children(list);
}

/**
 * True 360° Wall of Cinema — dense tiled cylinders using every movie in the app.
 */
export function FinaleCinemaWorld({ local = 0 }) {
  const open = Math.min(1, Math.max(0, (local - 0.02) / 0.55));
  const eased = open * open * (3 - 2 * open);

  return (
    <group>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 16, 42]} />
      <FinaleLights />
      <FinaleParticles open={eased} />

      <Suspense fallback={null}>
        <FinaleTextures>
          {(textures) => <CinemaWall textures={textures} open={eased} />}
        </FinaleTextures>
      </Suspense>
      <Suspense fallback={null}>
        <FinaleSilhouettes open={eased} />
      </Suspense>

      <FinalePostFX />
    </group>
  );
}
