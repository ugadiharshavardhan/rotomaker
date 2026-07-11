"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

const loader = new THREE.TextureLoader();
const cache = new Map();

function loadTexture(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }

  return new Promise((resolve) => {
    loader.crossOrigin = "anonymous";
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        cache.set(url, texture);
        resolve(texture);
      },
      undefined,
      () => resolve(null)
    );
  });
}

export function useSafeTextures(urls) {
  const [textures, setTextures] = useState(null);
  const key = urls.join("|");

  useEffect(() => {
    let cancelled = false;

    Promise.all(urls.map((url) => loadTexture(url))).then((results) => {
      if (!cancelled) setTextures(results);
    });

    return () => {
      cancelled = true;
    };
  }, [key, urls]);

  return textures;
}
