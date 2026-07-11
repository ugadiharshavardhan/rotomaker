"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { GALLERY } from "@/lib/galleryConfig";

function buildWallGrid(half, length, divisions) {
  const positions = [];
  const cell = (half * 2) / divisions;
  const z0 = -length / 2;
  const z1 = length / 2;

  const pushLine = (a, b) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  };

  for (let i = 0; i <= divisions; i++) {
    const x = -half + i * cell;
    pushLine([x, -half, z0], [x, -half, z1]);
  }
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + (i / divisions) * length;
    pushLine([-half, -half, z], [half, -half, z]);
  }

  for (let i = 0; i <= divisions; i++) {
    const x = -half + i * cell;
    pushLine([x, half, z0], [x, half, z1]);
  }
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + (i / divisions) * length;
    pushLine([-half, half, z], [half, half, z]);
  }

  for (let i = 0; i <= divisions; i++) {
    const y = -half + i * cell;
    pushLine([-half, y, z0], [-half, y, z1]);
  }
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + (i / divisions) * length;
    pushLine([-half, -half, z], [-half, half, z]);
  }

  for (let i = 0; i <= divisions; i++) {
    const y = -half + i * cell;
    pushLine([half, y, z0], [half, y, z1]);
  }
  for (let i = 0; i <= divisions; i++) {
    const z = z0 + (i / divisions) * length;
    pushLine([half, -half, z], [half, half, z]);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

const sharedGridGeometry = buildWallGrid(GALLERY.HALF, GALLERY.SEG_LEN, GALLERY.GRID_DIV);

export function GridWall({ opacity = 1 }) {
  const materialRef = useRef();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.opacity = GALLERY.GRID_OPACITY * opacity;
    }
  }, [opacity]);

  return (
    <lineSegments geometry={sharedGridGeometry}>
      <lineBasicMaterial
        ref={materialRef}
        color={GALLERY.GRID_COLOR}
        transparent
        opacity={GALLERY.GRID_OPACITY * opacity}
        depthWrite={false}
      />
    </lineSegments>
  );
}
