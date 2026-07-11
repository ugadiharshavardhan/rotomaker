"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getHeroStoryState } from "@/lib/heroStory";

function createBrandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("INVISIBLE ARTISTRY", 512, 150);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 120px Impact, Haettenschweiler, sans-serif";
  ctx.fillText("ROTOMAKER", 512, 280);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "26px monospace";
  ctx.fillText("Crafting Invisible Magic", 512, 355);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * 3D brand only for finale lineup — intro title is DOM-only (avoids corner ghosts).
 */
export function HeroBrandPlane({ progress }) {
  const mesh = useRef();
  const mat = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const tex = createBrandTexture();
    setTexture(tex);
    return () => tex.dispose();
  }, []);

  useFrame((state) => {
    const m = mesh.current;
    const material = mat.current;
    if (!m || !material || !texture) return;

    const s = getHeroStoryState(progress);
    const t = state.clock.elapsedTime;
    const isFinale = s.phase === "finale";

    if (!isFinale || s.brandOpacity <= 0.02) {
      m.visible = false;
      return;
    }

    m.visible = true;
    material.opacity = s.brandOpacity;
    m.position.x += (0 - m.position.x) * 0.1;
    // Sit above the bottom-anchored half characters
    m.position.y = 1.55 + Math.sin(t * 0.2) * 0.02;
    m.position.z = -3.0;
    m.scale.setScalar(1.08);
  });

  if (!texture) return null;

  return (
    <mesh ref={mesh} position={[0, 1.55, -3.0]} visible={false} renderOrder={18}>
      <planeGeometry args={[7.2, 3.6]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}
