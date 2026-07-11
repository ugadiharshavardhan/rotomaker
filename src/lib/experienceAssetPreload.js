import { useGLTF } from "@react-three/drei";
import { warmImageCache } from "@/lib/moviesImageCache";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { EXPERIENCE_IMAGE_URLS } from "@/lib/imagePreload";
import { SERVICE_IMAGE_URLS } from "@/lib/servicesData";
import { HERO_CHARACTER_IMAGES } from "@/lib/heroStory";
import { MOVIE_LIBRARY_IMAGES } from "@/lib/moviesData";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";

/** Heavy UI / WebGL effect modules — prefetch in background, never block first paint. */
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

/** Priority chunks required before intro — keep this list small. */
const PRIORITY_CHUNK_LOADERS = [
  () => import("@/components/experience/UnifiedCanvas"),
  () => import("@/components/Scene"),
  () => import("@/components/CameraModel"),
  () => import("@/components/Lighting"),
  () => import("@/components/Effects"),
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
  ...EFFECT_CHUNK_LOADERS,
];

export const EXPERIENCE_GLB_PATHS = [CAMERA_GLB_PATH, EARTH_GLB_PATH, DRAGON_GLB_PATH];

const CRITICAL_IMAGES = [
  "/got.jpg",
  "/spider-man-hanging.png",
  "/vfx/vfx-after.png",
  "/vfx/vfx-brfore.png",
  ...MOVIE_IMAGES,
  ...HERO_CHARACTER_IMAGES,
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
  EXPERIENCE_GLB_PATHS.forEach((path) => {
    try {
      useGLTF.preload(path);
    } catch {
      // Ignore preload registration failures.
    }
  });
}

/** Warm HTTP cache for GLBs (camera first). */
export function warmGlbHttpCache() {
  if (typeof window === "undefined") return;
  EXPERIENCE_GLB_PATHS.forEach((href) => {
    fetch(href, { cache: "force-cache" }).catch(() => {});
  });
}

/** Prefetch heavy JS chunks — priority first, then nearby scenes, then the rest. */
export function prefetchExperienceChunks() {
  if (chunkPrefetchStarted) return chunkPrefetchPromise;
  chunkPrefetchStarted = true;

  chunkPrefetchPromise = Promise.allSettled(PRIORITY_CHUNK_LOADERS.map((load) => load())).then(
    async () => {
      // Warm the next sections first so intro → services doesn't hitch.
      const nearTerm = CHUNK_LOADERS.slice(0, 8);
      const later = CHUNK_LOADERS.slice(8);
      await Promise.allSettled(nearTerm.map((load) => load()));
      return Promise.allSettled(later.map((load) => load()));
    }
  );
  return chunkPrefetchPromise;
}

/** Prefetch modules for the upcoming scene based on scroll progress. */
export function prefetchUpcomingByProgress(globalProgress) {
  if (typeof window === "undefined") return;

  if (globalProgress >= 0.26) {
    void import("@/components/scene2/ServicesWorld");
    void import("@/components/scene2/ServicesSection");
    void import("@/components/services/ServicesEvilEyeBg");
    void import("@/components/services/EvilEye");
    void import("@/components/services/ServicesGradientBlindsBg");
    void import("@/components/services/GradientBlinds");
  }
  if (globalProgress >= 0.42) {
    void import("@/components/scene5/Scene5World");
    void import("@/components/scene5/EarthGlobeModel");
    void import("@/components/scene5/Scene5Overlay");
  }
  if (globalProgress >= 0.55) {
    void import("@/components/scene6/Scene6World");
    void import("@/components/movies/MoviesWorld");
    void import("@/components/movies/DomeGallery");
  }
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
 * Awaitable boot gate — only blocks on critical assets so deploy/preview tabs
 * can paint quickly without exhausting WebGL / memory.
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

    report(onProgress, 0.04);
    preloadExperienceGlbs();

    // Camera GLB is required for intro; earth/dragon warm in background.
    try {
      await ensureGlbLoaded(CAMERA_GLB_PATH);
    } catch {
      // Continue — GlbWarmup / safety timeout still cover GPU ready.
    }
    bump(0.35);

    EXPERIENCE_GLB_PATHS.slice(1).forEach((url) => {
      ensureGlbLoaded(url).catch(() => {});
    });

    const criticalImages = uniqueUrls(CRITICAL_IMAGES);
    await warmImageCache(criticalImages);
    bump(0.25);

    // Priority canvas chunks only — remaining modules prefetch after ready.
    chunkPrefetchStarted = true;
    await Promise.allSettled(
      PRIORITY_CHUNK_LOADERS.map(async (load) => {
        try {
          await load();
        } finally {
          bump(0.28 / PRIORITY_CHUNK_LOADERS.length);
        }
      })
    );

    // Near-term scenes first (portfolio → services), then the rest.
    const nearTerm = CHUNK_LOADERS.slice(0, 8);
    const later = CHUNK_LOADERS.slice(8);
    chunkPrefetchPromise = Promise.allSettled(nearTerm.map((load) => load())).then(() =>
      Promise.allSettled(later.map((load) => load()))
    );
    void chunkPrefetchPromise;

    // Remaining images in background.
    void warmImageCache(
      uniqueUrls([...EXPERIENCE_IMAGE_URLS, ...SERVICE_IMAGE_URLS, ...MOVIE_LIBRARY_IMAGES])
    );

    report(onProgress, 0.92);
  })().catch((error) => {
    console.warn("[preload] Experience warm-up failed:", error);
    report(onProgress, 0.92);
  });

  return readyPromise;
}
