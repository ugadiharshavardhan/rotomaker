"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import {
  getEarthRadiusFromGeometry,
  getGlobeScaleFromGeometry,
  prepareEarthGeometry,
} from "@/lib/globeCoordinates";
import { EarthGlobeProvider } from "./EarthGlobeContext";

useGLTF.preload(EARTH_GLB_PATH);

function useEarthDiffuseFromGlb(gltf) {
  const [earthMap, setEarthMap] = useState(null);

  useEffect(() => {
    if (!gltf?.parser) return undefined;

    let cancelled = false;

    async function loadMap() {
      try {
        let texture = await gltf.parser.getDependency("texture", 0);

        if (!texture) {
          const image = await gltf.parser.getDependency("image", 0);
          texture = new THREE.Texture(image);
          texture.needsUpdate = true;
        }

        if (cancelled || !texture) return;

        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 16;
        setEarthMap(texture);
      } catch {
        if (!cancelled) setEarthMap(null);
      }
    }

    loadMap();

    return () => {
      cancelled = true;
    };
  }, [gltf]);

  return earthMap;
}

export const EarthGlobeModel = forwardRef(function EarthGlobeModel({ children, ...props }, ref) {
  const gltf = useGLTF(EARTH_GLB_PATH);
  const earthMap = useEarthDiffuseFromGlb(gltf);

  const prepared = useMemo(() => {
    if (!earthMap) return null;

    const geometry = prepareEarthGeometry(gltf.scene);
    if (!geometry) return null;

    const material = new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: 0.35,
    });

    const scale = getGlobeScaleFromGeometry(geometry);
    const radius = getEarthRadiusFromGeometry(geometry);

    return { geometry, material, scale, radius };
  }, [gltf.scene, earthMap]);

  if (!prepared) return null;

  return (
    <EarthGlobeProvider radius={prepared.radius}>
      <group ref={ref} scale={prepared.scale} {...props}>
        <mesh geometry={prepared.geometry} material={prepared.material} castShadow receiveShadow />
        {children}
      </group>
    </EarthGlobeProvider>
  );
});
