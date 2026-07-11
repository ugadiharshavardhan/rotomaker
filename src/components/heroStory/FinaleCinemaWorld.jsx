"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { GALLERY_POSTER_URLS } from "@/lib/galleryPosters";
import { HERO_CHARACTERS } from "@/lib/heroStory";

const SHARED_PLANE = new THREE.PlaneGeometry(1, 1.5);
const FILM_STRIP = new THREE.PlaneGeometry(0.12, 2.4);
const APERTURE = new THREE.RingGeometry(0.35, 0.48, 32);
const CHROMA_OFFSET = new THREE.Vector2(0.0004, 0.0004);

/** Concentric cinema hall — radii large enough the eye never sees the full ring. */
const RINGS = [
  { radius: 20, count: 28, speed: 0.018, dir: 1, opacity: 0.92, ySpread: 7 },
  { radius: 26, count: 34, speed: 0.012, dir: -1, opacity: 0.82, ySpread: 9 },
  { radius: 33, count: 42, speed: 0.009, dir: 1, opacity: 0.7, ySpread: 11 },
  { radius: 41, count: 48, speed: 0.006, dir: -1, opacity: 0.55, ySpread: 13 },
  { radius: 50, count: 54, speed: 0.004, dir: 1, opacity: 0.4, ySpread: 15 },
  { radius: 62, count: 58, speed: 0.0025, dir: -1, opacity: 0.28, ySpread: 17 },
];

const TEX_CAP = 18;
/** Keep a forward corridor empty so the logo never sits on a poster. */
const LOGO_GAP = 0.55;

function hash01(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function getFinalePosterUrls() {
  const seen = new Set();
  const urls = [];
  for (const url of [...MOVIE_IMAGES, ...GALLERY_POSTER_URLS]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= TEX_CAP) break;
  }
  return urls.length ? urls : ["/cards/spiderman.jpg"];
}

/**
 * Full 360° cylinder of posters facing the center.
 * Angle 0 = straight ahead (−Z). Gap near 0 leaves the logo corridor clear.
 */
function buildRingPosters(ringIndex, ring) {
  const items = [];
  const seed = ringIndex * 97.3;

  for (let i = 0; i < ring.count; i++) {
    const h = hash01(seed + i * 3.17);
    const h2 = hash01(seed + i * 7.91);
    const h3 = hash01(seed + i * 13.3);
    const h4 = hash01(seed + i * 19.7);

    let angle = (i / ring.count) * Math.PI * 2 + (h - 0.5) * 0.18;

    // Forward logo corridor — skip mid-band posters that would cover the brand
    const forwardDist = Math.min(
      Math.abs(angle),
      Math.abs(angle - Math.PI * 2)
    );
    const inLogoCone = forwardDist < LOGO_GAP;
    const yBase = (h2 - 0.5) * ring.ySpread;
    if (inLogoCone && Math.abs(yBase) < 2.8) {
      // Push to upper/lower band instead of deleting (keeps density)
      const push = yBase >= 0 ? 3.2 + h3 * 2 : -(3.2 + h3 * 2);
      items.push(makePoster(ringIndex, i, ring, angle, push, h, h2, h3, h4, true));
      continue;
    }

    items.push(makePoster(ringIndex, i, ring, angle, yBase, h, h2, h3, h4, false));
  }
  return items;
}

function makePoster(ringIndex, i, ring, angle, y, h, h2, h3, h4, forcedEdge) {
  const radiusJitter = (h3 - 0.5) * 1.8;
  const r = ring.radius + radiusJitter;
  const x = Math.sin(angle) * r;
  const z = -Math.cos(angle) * r;

  const hero = !forcedEdge && i % 9 === 0;
  const baseW = hero ? 2.8 + h * 0.4 : 1.05 + h2 * 0.75;
  const baseH = baseW * (1.45 + h4 * 0.15);

  // Face inward toward world origin
  const rotY = Math.atan2(x, z) + Math.PI;
  const tiltX = (h - 0.5) * 0.14;
  const tiltZ = (h2 - 0.5) * 0.1;

  return {
    id: `${ringIndex}-${i}`,
    ringIndex,
    x,
    y: y + (h4 - 0.5) * 0.6,
    z,
    rotY,
    rotX: tiltX,
    rotZ: tiltZ,
    scaleW: baseW,
    scaleH: baseH,
    tex: Math.floor(h * 997),
    phase: h * Math.PI * 2,
    speed: 0.15 + h2 * 0.4,
    opacity: ring.opacity * (0.75 + h3 * 0.25),
    hero,
    brightness: 0.65 + h4 * 0.45,
  };
}

function PosterRing({ ring, ringIndex, textures, open }) {
  const group = useRef();
  const mats = useRef([]);
  const layout = useMemo(() => buildRingPosters(ringIndex, ring), [ring, ringIndex]);
  const texCount = Math.max(1, textures.length);

  // Staggered ring reveal — near rings first, then outer
  const ringReveal = Math.min(
    1,
    Math.max(0, (open - ringIndex * 0.09) / 0.35)
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;

    g.rotation.y = t * ring.speed * ring.dir;

    const children = g.children;
    for (let i = 0; i < layout.length; i++) {
      const item = layout[i];
      const mesh = children[i];
      const mat = mats.current[i];
      if (!mesh || !mat) continue;

      const breath = Math.sin(t * item.speed + item.phase);
      const drift = Math.cos(t * item.speed * 0.7 + item.phase);

      mesh.position.set(
        item.x + drift * 0.04,
        item.y + breath * 0.12,
        item.z + breath * 0.06
      );
      mesh.rotation.set(
        item.rotX,
        item.rotY + Math.sin(t * 0.08 + item.phase) * 0.012,
        item.rotZ + drift * 0.008
      );

      const s = 0.92 + ringReveal * 0.08 + breath * 0.015;
      mesh.scale.set(item.scaleW * s, item.scaleH * s, 1);
      mesh.visible = ringReveal > 0.02;

      const depthFade = ringIndex / Math.max(1, RINGS.length - 1);
      mat.opacity =
        item.opacity * ringReveal * (0.55 + open * 0.45) * (1 - depthFade * 0.15);
      mat.color.setRGB(item.brightness, item.brightness, item.brightness);
    }
  });

  return (
    <group ref={group}>
      {layout.map((item, i) => (
        <mesh
          key={item.id}
          geometry={SHARED_PLANE}
          position={[item.x, item.y, item.z]}
          rotation={[item.rotX, item.rotY, item.rotZ]}
          frustumCulled
          renderOrder={2 + ringIndex}
        >
          <meshBasicMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            map={textures[item.tex % texCount]}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function CinemaWall({ textures, open }) {
  return (
    <group>
      {RINGS.map((ring, i) => (
        <PosterRing
          key={i}
          ring={ring}
          ringIndex={i}
          textures={textures}
          open={open}
        />
      ))}
    </group>
  );
}

/** Dark volumetric mist — never light-gray overlay sheets. */
function FinaleVolumetricFog({ open = 0 }) {
  const mats = useRef([]);
  const layers = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        z: -6 - i * 7,
        scale: 28 + i * 10,
        opacity: 0.045 + i * 0.012,
        speed: 0.12 + i * 0.03,
        phase: i * 1.7,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mats.current.forEach((m, i) => {
      if (!m) return;
      const layer = layers[i];
      const pulse = 0.85 + Math.sin(t * layer.speed + layer.phase) * 0.15;
      m.opacity = layer.opacity * open * pulse;
    });
  });

  return (
    <group>
      {layers.map((layer, i) => (
        <mesh
          key={i}
          geometry={SHARED_PLANE}
          position={[0, 0.4, layer.z]}
          scale={[layer.scale, layer.scale * 0.55, 1]}
          renderOrder={20 + i}
          frustumCulled={false}
        >
          <meshBasicMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            color="#0c0c0c"
            transparent
            opacity={0}
            depthWrite={false}
            depthTest={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Soft god-ray shafts — dark warm, additive but low so blacks stay black. */
function GodRays({ open = 0 }) {
  const group = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((mesh, i) => {
      mesh.material.opacity =
        (0.018 + open * 0.02) * (0.7 + Math.sin(t * 0.2 + i) * 0.3);
      mesh.rotation.z = Math.sin(t * 0.05 + i) * 0.04;
    });
  });

  const shafts = useMemo(
    () => [
      { x: -8, y: 2, z: -14, rot: 0.35, s: [1.2, 18] },
      { x: 7, y: 3, z: -18, rot: -0.28, s: [0.9, 16] },
      { x: -3, y: 4, z: -28, rot: 0.12, s: [0.7, 22] },
      { x: 10, y: 1, z: -22, rot: -0.4, s: [1.0, 14] },
    ],
    []
  );

  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh
          key={i}
          geometry={SHARED_PLANE}
          position={[s.x, s.y, s.z]}
          rotation={[0, 0, s.rot]}
          scale={[s.s[0], s.s[1], 1]}
          renderOrder={6}
        >
          <meshBasicMaterial
            color="#3a3428"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function FilmElements({ open = 0 }) {
  const group = useRef();
  const items = useMemo(() => {
    const list = [];
    for (let i = 0; i < 16; i++) {
      const h = hash01(i * 41.2);
      const h2 = hash01(i * 88.1);
      const angle = h * Math.PI * 2;
      const r = 22 + h2 * 28;
      list.push({
        type: i % 3 === 0 ? "ring" : "strip",
        x: Math.sin(angle) * r,
        y: (h - 0.5) * 10,
        z: -Math.cos(angle) * r,
        rotY: angle + Math.PI,
        phase: h * 6,
        speed: 0.04 + h2 * 0.06,
      });
    }
    return list;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.children.forEach((mesh, i) => {
      const item = items[i];
      if (!item) return;
      mesh.rotation.z = t * item.speed + item.phase;
      mesh.material.opacity = 0.06 * open * (0.7 + Math.sin(t * 0.3 + item.phase) * 0.3);
    });
  });

  return (
    <group ref={group}>
      {items.map((item, i) => (
        <mesh
          key={i}
          geometry={item.type === "ring" ? APERTURE : FILM_STRIP}
          position={[item.x, item.y, item.z]}
          rotation={[0, item.rotY, 0]}
          renderOrder={5}
        >
          <meshBasicMaterial
            color="#8a8a8a"
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Hidden silhouettes between posters — rim only, discoverable.
 */
function FinaleSilhouettes({ open = 0 }) {
  const picks = useMemo(
    () => [
      HERO_CHARACTERS[0],
      HERO_CHARACTERS[1],
      HERO_CHARACTERS[2],
      HERO_CHARACTERS[3],
    ],
    []
  );
  const textures = useTexture(picks.map((c) => c.image));

  textures.forEach((tex) => {
    if (tex && tex.colorSpace !== THREE.SRGBColorSpace) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
  });

  const slots = useMemo(
    () => [
      { angle: 1.15, r: 21.5, y: -1.4, s: [2.4, 3.6] },
      { angle: -1.35, r: 23, y: -1.5, s: [2.2, 3.4] },
      { angle: 2.4, r: 27, y: -1.3, s: [2.0, 3.1] },
      { angle: -2.2, r: 29, y: -1.45, s: [2.1, 3.2] },
    ],
    []
  );

  return (
    <group>
      {picks.map((character, i) => {
        const slot = slots[i];
        const appear = Math.min(1, Math.max(0, (open - 0.2 - i * 0.1) / 0.5));
        if (appear < 0.02) return null;
        const x = Math.sin(slot.angle) * slot.r;
        const z = -Math.cos(slot.angle) * slot.r;
        const rotY = Math.atan2(x, z) + Math.PI;
        return (
          <mesh
            key={character.id}
            geometry={SHARED_PLANE}
            position={[x, slot.y, z]}
            rotation={[0, rotY, 0]}
            scale={[slot.s[0] * appear, slot.s[1] * appear, 1]}
            renderOrder={12}
          >
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={0.18 + appear * 0.16}
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
  const dust = useMemo(() => makePoints(900, 70, 28, 80), []);
  const embers = useMemo(() => makePoints(180, 50, 20, 60), []);
  const stars = useMemo(() => makePoints(220, 90, 40, 100, true), []);
  const group = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.rotation.y = t * 0.004;
    const a = 0.35 + open * 0.55;
    if (g.children[0]) g.children[0].material.opacity = 0.07 * a;
    if (g.children[1]) g.children[1].material.opacity = 0.12 * a;
    if (g.children[2]) g.children[2].material.opacity = 0.28 * a;
  });

  return (
    <group ref={group}>
      <points geometry={dust} renderOrder={4}>
        <pointsMaterial
          size={0.028}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#c8c4b8"
          opacity={0.05}
          sizeAttenuation
        />
      </points>
      <points geometry={embers} renderOrder={4}>
        <pointsMaterial
          size={0.04}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#d4a574"
          opacity={0.08}
          sizeAttenuation
        />
      </points>
      <points geometry={stars} renderOrder={1}>
        <pointsMaterial
          size={0.03}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#e8e8e8"
          opacity={0.18}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

function makePoints(count, sx, sy, depth, far = false) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = far ? 35 + Math.random() * depth : 8 + Math.random() * (sx * 0.5);
    pos[i * 3] = Math.sin(angle) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * sy;
    pos[i * 3 + 2] = -Math.cos(angle) * r + (far ? -10 : 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return g;
}

function FinaleLights({ open = 0 }) {
  return (
    <>
      <ambientLight intensity={0.03} />
      <pointLight
        position={[0, 1.2, 0]}
        intensity={1.4 + open * 0.5}
        distance={14}
        color="#ffffff"
      />
      <pointLight position={[-14, 3, -8]} intensity={0.9} distance={36} color="#4a6a9a" />
      <pointLight position={[14, 2, -10]} intensity={0.7} distance={32} color="#8a6040" />
      <pointLight position={[0, 6, -20]} intensity={0.5} distance={40} color="#2a3548" />
      <spotLight
        position={[0, 8, 2]}
        angle={0.55}
        penumbra={0.95}
        intensity={2.2 + open * 0.8}
        distance={50}
        color="#ffffff"
      />
    </>
  );
}

function FinalePostFX({ open = 0 }) {
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        focusDistance={0.018}
        focalLength={0.04}
        bokehScale={1.4 + open * 0.6}
        height={480}
      />
      <Bloom
        intensity={0.14 + open * 0.06}
        luminanceThreshold={0.68}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CHROMA_OFFSET}
      />
      <Noise opacity={0.025} blendFunction={BlendFunction.SOFT_LIGHT} />
      <Vignette eskil offset={0.28} darkness={0.78} />
    </EffectComposer>
  );
}

function FinaleTextures({ children }) {
  const urls = useMemo(() => getFinalePosterUrls(), []);
  const textures = useTexture(urls);
  const list = useMemo(() => {
    const arr = Array.isArray(textures) ? textures : [textures];
    arr.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
    });
    return arr;
  }, [textures]);
  return children(list);
}

/**
 * Infinite 360° Wall of Cinema — camera stands inside concentric poster rings.
 * Logo stays clear via forward corridor; no light-gray fog wash.
 */
export function FinaleCinemaWorld({ local = 0 }) {
  const open = Math.min(1, Math.max(0, (local - 0.02) / 0.65));
  const eased = open * open * (3 - 2 * open);

  return (
    <group>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 16, 72]} />
      <FinaleLights open={eased} />
      <FinaleParticles open={eased} />
      <GodRays open={eased} />
      <FinaleVolumetricFog open={eased} />

      <Suspense fallback={null}>
        <FinaleTextures>
          {(textures) => <CinemaWall textures={textures} open={eased} />}
        </FinaleTextures>
        <FinaleSilhouettes open={eased} />
        <FilmElements open={eased} />
      </Suspense>

      <FinalePostFX open={eased} />
    </group>
  );
}
