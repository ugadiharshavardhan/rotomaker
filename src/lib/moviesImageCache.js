/** In-memory image warm-cache so DomeGallery tiles paint instantly from cache. */

const cache = new Map();

export function warmImage(src) {
  const url = typeof src === "string" ? src.trim() : "";
  if (!url || typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const existing = cache.get(url);
  if (existing) return existing.promise;

  const img = new window.Image();
  img.decoding = "async";
  img.fetchPriority = "high";
  img.referrerPolicy = "no-referrer";

  const entry = {
    img,
    ready: false,
    ok: false,
    promise: new Promise((resolve) => {
      img.onload = () => {
        entry.ready = true;
        entry.ok = img.naturalWidth > 0;
        resolve(entry.ok ? img : null);
      };
      img.onerror = () => {
        entry.ready = true;
        entry.ok = false;
        resolve(null);
      };
      img.src = url;
    }),
  };

  cache.set(url, entry);
  return entry.promise;
}

export function warmImageCache(urls) {
  return Promise.all(
    urls
      .filter((src) => typeof src === "string" && src.trim().length > 0)
      .map((src) => warmImage(src.trim()))
  );
}

export function isImageReady(src) {
  const url = typeof src === "string" ? src.trim() : "";
  const entry = cache.get(url);
  return Boolean(entry?.ready && entry?.ok);
}

export function getWarmImage(src) {
  const url = typeof src === "string" ? src.trim() : "";
  const entry = cache.get(url);
  return entry?.ok ? entry.img : null;
}
