"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GALLERY, getCellSize, getCellZ, hash01 } from "@/lib/galleryConfig";

const WALLS = ["left", "right", "floor", "ceiling"];

function wallTransform(wall, u, half, inset) {
  switch (wall) {
    case "left":
      return {
        position: [-half + inset, u, 0],
        rotation: [0, Math.PI / 2, 0],
      };
    case "right":
      return {
        position: [half - inset, u, 0],
        rotation: [0, -Math.PI / 2, 0],
      };
    case "floor":
      return {
        position: [u, -half + inset, 0],
        rotation: [-Math.PI / 2, 0, 0],
      };
    case "ceiling":
      return {
        position: [u, half - inset, 0],
        rotation: [Math.PI / 2, 0, 0],
      };
    default:
      return { position: [0, 0, 0], rotation: [0, 0, 0] };
  }
}

function slotToState(slot, textureCount) {
  const cell = getCellSize();
  const u = -GALLERY.HALF + cell * (slot.crossIdx + 0.5);
  const pad = GALLERY.CELL_PAD;
  const size = { w: cell - pad, h: cell - pad };
  const { position, rotation } = wallTransform(slot.wall, u, GALLERY.HALF, 0.025);

  return {
    wall: slot.wall,
    size,
    localPos: position,
    baseRot: rotation,
    texIndex: Math.floor(hash01(slot.seed + 11) * Math.max(1, textureCount)),
    phase: hash01(slot.seed + 31) * Math.PI * 2,
    speed: 0.4 + hash01(slot.seed + 37) * 0.35,
    floatAmp: 0.008 + hash01(slot.seed + 41) * 0.012,
    z: slot.z,
    seed: slot.seed,
    crossIdx: slot.crossIdx,
  };
}

/**
 * Build dense grid-aligned poster slots, then subsample to POSTER_COUNT.
 * Walls are filled heavily; floor/ceiling moderately — posters sit in cell centers.
 */
function buildDenseSlots(totalLen) {
  const cellZ = getCellZ();
  const rings = Math.max(1, Math.floor(totalLen / cellZ));
  const slots = [];

  for (let zi = 0; zi < rings; zi++) {
    const z = -zi * cellZ - cellZ * 0.5;
    for (let w = 0; w < 4; w++) {
      const wall = WALLS[w];
      const isSide = w < 2;
      for (let c = 0; c < GALLERY.GRID_DIV; c++) {
        const seed = zi * 128 + w * 16 + c * 3 + 7;
        const threshold = isSide ? 0.04 : 0.3;
        if (hash01(seed) < threshold) continue;
        slots.push({ wall, crossIdx: c, z, seed });
      }
    }
  }

  if (slots.length <= GALLERY.POSTER_COUNT) return slots;

  const picked = [];
  const step = slots.length / GALLERY.POSTER_COUNT;
  for (let i = 0; i < GALLERY.POSTER_COUNT; i++) {
    picked.push(slots[Math.min(slots.length - 1, Math.floor(i * step))]);
  }
  return picked;
}

function buildInitialStates(textureCount, totalLen) {
  return buildDenseSlots(totalLen).map((slot) => slotToState(slot, textureCount));
}

function GalleryPoster({ texture, stateRef, index, opacity, reveal }) {
  const meshRef = useRef();
  const matRef = useRef();

  useFrame((clockState) => {
    const mesh = meshRef.current;
    const state = stateRef.current?.[index];
    if (!mesh || !state) return;

    const t = clockState.clock.elapsedTime;
    const { phase, speed, floatAmp, baseRot, localPos, wall, size } = state;

    const float = Math.sin(t * speed + phase) * floatAmp;

    mesh.position.set(
      localPos[0],
      localPos[1] + (wall === "left" || wall === "right" ? float : 0),
      localPos[2] + (wall === "floor" || wall === "ceiling" ? float : 0)
    );
    mesh.rotation.set(baseRot[0], baseRot[1], baseRot[2]);

    const s = reveal;
    mesh.scale.set(size.w * s, size.h * s, 1);

    if (matRef.current) {
      matRef.current.opacity = opacity * reveal;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={opacity}
        roughness={0.5}
        metalness={0.04}
        side={THREE.DoubleSide}
        toneMapped
      />
    </mesh>
  );
}

export function PosterField({ textures, cameraZRef, opacity = 1, entrance = 1 }) {
  const groupRefs = useRef([]);
  const statesRef = useRef(null);
  const texList = useMemo(() => textures?.filter(Boolean) ?? [], [textures]);
  const totalLen = GALLERY.SEG_COUNT * GALLERY.SEG_LEN;
  const count = GALLERY.POSTER_COUNT;

  // Build layout once when textures are ready — never rebuild (avoids image swaps)
  const states = useMemo(() => {
    if (texList.length === 0) return null;
    return buildInitialStates(texList.length, totalLen);
  }, [texList, totalLen]);

  if (states && statesRef.current !== states) {
    statesRef.current = states;
  }

  useFrame(() => {
    if (!statesRef.current || texList.length === 0) return;
    const camZ = cameraZRef.current;
    const behind = getCellZ() * 1.5;
    const ahead = totalLen - getCellZ() * 4;

    // Only wrap Z — keep the same wall, cell, and image forever (no blink)
    statesRef.current.forEach((state, i) => {
      while (state.z > camZ + behind) {
        state.z -= totalLen;
      }
      while (state.z < camZ - ahead) {
        state.z += totalLen;
      }

      const g = groupRefs.current[i];
      if (g) g.position.z = state.z;
    });
  });

  if (texList.length === 0 || !states) return null;

  return (
    <group>
      {states.map((state, i) => (
        <group
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          position={[0, 0, state.z]}
        >
          <GalleryPoster
            texture={texList[state.texIndex % texList.length]}
            stateRef={statesRef}
            index={i}
            opacity={opacity}
            reveal={entrance}
          />
        </group>
      ))}
    </group>
  );
}
