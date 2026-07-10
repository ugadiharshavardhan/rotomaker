"use client";

import { forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { prepareEarthRoot } from "@/lib/globeCoordinates";

useGLTF.preload(EARTH_GLB_PATH);

export const EarthGlobeModel = forwardRef(function EarthGlobeModel(props, ref) {
  const gltf = useGLTF(EARTH_GLB_PATH);
  const prepared = useMemo(() => prepareEarthRoot(gltf.scene), [gltf.scene]);

  if (!prepared) return null;

  return (
    <group ref={ref} scale={prepared.scale} {...props}>
      <primitive object={prepared.root} />
    </group>
  );
});
