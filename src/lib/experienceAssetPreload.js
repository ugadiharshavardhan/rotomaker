import { useGLTF } from "@react-three/drei";
import { warmImageCache } from "@/lib/moviesImageCache";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { EXPERIENCE_IMAGE_URLS } from "@/lib/imagePreload";
import { SERVICE_IMAGE_URLS } from "@/lib/servicesData";
import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";

/** Heavy UI / WebGL effect modules that must be ready before intro. */
export const EFFECT_CHUNK_LOADERS = [
  () => import("@/components/services/EvilEye"),
  () => import("@/components/about/Hyperspeed"),
  () => import("@/components/services/GradientBlinds"),
  () => import("@/components/movies/DomeGallery"),
  () => import("@/components/scene6/CircularGallery"),
  () => import("@/components/scene1/LightRays"),
  () => import("@/components/scene1/LightRaysR3F"),
  () => import("@/components/services/ServicesEvilEyeBg"),
  () => import("@/components/about/StoryHyperspeedBg"),
  () => import("@/components/services/ServicesGradientBlindsBg"),
  () => import("@/components/movies/MoviesLibrarySection"),
  () => import("@/components/scene6/ReelCircularGallery"),
];

/** Priority chunks — canvas + camera path. */
const PRIORITY_CHUNK_LOADERS = [
  () => import("@/components/experience/UnifiedCanvas"),
  () => import("@/components/Scene"),
  () => import("@/components/CameraModel"),
  () => import("@/components/Lighting"),
  () => import("@/components/Effects"),
  ...EFFECT_CHUNK_LOADERS,
];

const CHUNK_LOADERS = [
  () => import("@/components/scene2/Scene2Overlay"),
  () => import("@/components/scene2/Scene2World"),
  () => import("@/components/scene2/ServicesWorld"),
  () => import("@/components/scene2/ServicesSection"),
  () => import("@/components/scene4/Scene4World"),
  () => import("@/components/scene4/Scene4Overlay"),
  () => import("@/components/scene5/Scene5World"),
  () => import("@/components/scene5/EarthGlobeModel"),
  () => import("@/components/scene5/Scene5Overlay"),
  () => import("@/components/scene6/Scene6World"),
  () => import("@/components/scene6/Scene6Overlay"),
  () => import("@/components/movies/MoviesWorld"),
  () => import("@/components/scene7/Scene7World"),
  () => import("@/components/scene8/Scene8Overlay"),
  () => import("@/components/scene9/Scene9World"),
  () => import("@/components/scene9/Scene9Overlay"),
  () => import("@/components/about/AboutWorld"),
  () => import("@/components/about/AboutSection"),
  () => import("@/components/about/WhyWorld"),
  () => import("@/components/about/WhySection"),
  () => import("@/components/scene12/Scene12World"),
  () => import("@/components/scene12/Scene12Overlay"),
  () => import("@/components/scene1/HangingSpiderMan"),
  () => import("@/components/scene1/HeroBrand"),
  () => import("@/components/typography/HeroTypography"),
];

export const EXPERIENCE_GLB_PATHS = [CAMERA_GLB_PATH, EARTH_GLB_PATH, DRAGON_GLB_PATH];

const MOVIE_LIBRARY_IMAGES = MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
  category.movies.map((movie) => movie.image).filter(Boolean)
);

const CRITICAL_IMAGES = [
  "/got.jpg",
  "/spider-man-hanging.png",
  "/vfx/vfx-after.png",
  "/vfx/vfx-brfore.png",
  ...MOVIE_IMAGES,
];

function uniqueUrls(urls) {
  return [...new Set(urls.filter((src) => typeof src === "string" && src.trim().length > 0))];
}

let glbPreloadStarted = false;
let chunkPrefetchStarted = false;
let chunkPrefetchPromise = null;
let readyPromise = null;

function report(onProgress, value) {
  onProgress?.(Math.max(0, Math.min(1, value)));
}

/** Download a GLB fully into HTTP cache, then register it with drei. */
async function ensureGlbLoaded(url) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  await response.arrayBuffer();
  useGLTF.preload(url);
}

/** Start GLB downloads as early as possible (drei cache). */
export function preloadExperienceGlbs() {
  if (glbPreloadStarted || typeof window === "undefined") return;
  glbPreloadStarted = true;
  EXPERIENCE_GLB_PATHS.forEach((path) => useGLTF.preload(path));
}

/** Warm HTTP cache for GLBs (camera first). */
export function warmGlbHttpCache() {
  if (typeof window === "undefined") return;
  EXPERIENCE_GLB_PATHS.forEach((href) => {
    fetch(href, { cache: "force-cache" }).catch(() => {});
  });
}

/** Prefetch heavy JS chunks — priority effects first, then the rest. */
export function prefetchExperienceChunks() {
  if (chunkPrefetchStarted) return chunkPrefetchPromise;
  chunkPrefetchStarted = true;

  chunkPrefetchPromise = Promise.allSettled(PRIORITY_CHUNK_LOADERS.map((load) => load())).then(
    () => Promise.allSettled(CHUNK_LOADERS.map((load) => load()))
  );
  return chunkPrefetchPromise;
}

/** Full warm-up — fire-and-forget (legacy). */
export function warmExperienceAssets() {
  preloadExperienceGlbs();
  warmGlbHttpCache();
  if (typeof window !== "undefined") {
    void warmImageCache(
      uniqueUrls([
        ...CRITICAL_IMAGES,
        ...EXPERIENCE_IMAGE_URLS,
        ...SERVICE_IMAGE_URLS,
        ...MOVIE_LIBRARY_IMAGES,
      ])
    );
  }
  return prefetchExperienceChunks();
}

/**
 * Awaitable boot gate — loads GLBs, images, effect modules, and scene chunks
 * before the intro is shown.
 */
export function waitForExperienceReady(onProgress) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (readyPromise) {
    report(onProgress, 1);
    return readyPromise;
  }

  readyPromise = (async () => {
    let progress = 0;
    const bump = (amount) => {
      progress = Math.min(0.92, progress + amount);
      report(onProgress, progress);
    };

    report(onProgress, 0.02);
    preloadExperienceGlbs();

    const imageUrls = uniqueUrls([
      ...CRITICAL_IMAGES,
      ...EXPERIENCE_IMAGE_URLS,
      ...SERVICE_IMAGE_URLS,
      ...MOVIE_LIBRARY_IMAGES,
    ]);

    const glbWeight = 0.42;
    const imageWeight = 0.22;
    const chunkWeight = 0.28;

    const glbShare = glbWeight / EXPERIENCE_GLB_PATHS.length;
    await Promise.all(
      EXPERIENCE_GLB_PATHS.map(async (url) => {
        try {
          await ensureGlbLoaded(url);
        } catch {
          // Continue boot even if one optional asset fails.
        } finally {
          bump(glbShare);
        }
      })
    );

    const imageBatch = Math.max(1, Math.ceil(imageUrls.length / 10));
    for (let i = 0; i < imageUrls.length; i += imageBatch) {
      const slice = imageUrls.slice(i, i + imageBatch);
      await warmImageCache(slice);
      bump(imageWeight * (slice.length / Math.max(1, imageUrls.length)));
    }

    chunkPrefetchStarted = true;
    const allChunkLoaders = [...PRIORITY_CHUNK_LOADERS, ...CHUNK_LOADERS];
    const chunkShare = chunkWeight / allChunkLoaders.length;
    chunkPrefetchPromise = Promise.allSettled(
      allChunkLoaders.map(async (load) => {
        try {
          await load();
        } finally {
          bump(chunkShare);
        }
      })
    );
    await chunkPrefetchPromise;

    // Leave headroom for GPU warm + effect mount settle (0.92 → 1.0).
    report(onProgress, 0.92);
  })().catch((error) => {
    console.warn("[preload] Experience warm-up failed:", error);
    report(onProgress, 0.92);
  });

  return readyPromise;
}
