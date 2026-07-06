/** In-memory image warm-cache so DomeGallery tiles paint instantly from cache. */

const cache = new Map();

export function warmImage(src) {
  if (!src || typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const existing = cache.get(src);
  if (existing) return existing.promise;

  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "high";

  const entry = {
    img,
    ready: false,
    promise: new Promise((resolve) => {
      const finish = () => {
        entry.ready = true;
        resolve(img);
      };
      img.onload = finish;
      img.onerror = finish;
      img.src = src;
    }),
  };

  cache.set(src, entry);
  return entry.promise;
}

export function warmImageCache(urls) {
  return Promise.all(urls.map((src) => warmImage(src)));
}

export function isImageReady(src) {
  return Boolean(cache.get(src)?.ready);
}

export function getWarmImage(src) {
  return cache.get(src)?.img ?? null;
}
