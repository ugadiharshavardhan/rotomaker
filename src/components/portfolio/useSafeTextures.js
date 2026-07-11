"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

const loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";
const cache = new Map();

function loadTexture(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }

  return new Promise((resolve) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
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

/** Kick off GPU texture loads early (idempotent). */
export function warmTextureUrls(urls) {
  if (!urls?.length) return;
  urls.forEach((url) => {
    void loadTexture(url);
  });
}

/**
 * Progressive texture hook — publishes results as they arrive so the
 * gallery can render with local cards before remote images finish.
 */
export function useSafeTextures(urls) {
  const [textures, setTextures] = useState(null);
  const key = urls.join("|");

  useEffect(() => {
    let cancelled = false;
    const results = new Array(urls.length).fill(null);
    let settled = 0;

    const publish = () => {
      if (!cancelled) setTextures(results.slice());
    };

    urls.forEach((url, i) => {
      void loadTexture(url).then((tex) => {
        if (cancelled) return;
        results[i] = tex;
        settled += 1;
        // Publish after first local batch, then every few, then final
        if (settled === 1 || settled === Math.min(6, urls.length) || settled % 5 === 0 || settled === urls.length) {
          publish();
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [key, urls]);

  return textures;
}
