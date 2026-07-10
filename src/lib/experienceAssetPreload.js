import { useGLTF } from "@react-three/drei";
import { warmImageCache } from "@/lib/moviesImageCache";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { EARTH_GLB_PATH } from "@/lib/globeModelPath";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";

const CHUNK_LOADERS = [
  () => import("@/components/scene2/Scene2Overlay"),
  () => import("@/components/scene2/Scene2World"),
  () => import("@/components/Scene"),
  () => import("@/components/scene2/ServicesWorld"),
  () => import("@/components/scene4/Scene4World"),
  () => import("@/components/scene5/Scene5World"),
  () => import("@/components/scene6/Scene6World"),
  () => import("@/components/movies/MoviesWorld"),
  () => import("@/components/scene7/Scene7World"),
  () => import("@/components/scene9/Scene9World"),
  () => import("@/components/about/AboutWorld"),
  () => import("@/components/about/WhyWorld"),
  () => import("@/components/scene12/Scene12World"),
  () => import("@/components/services/EvilEye"),
  () => import("@/components/services/GradientBlinds"),
  () => import("@/components/about/Hyperspeed"),
  () => import("@/components/scene1/LightRays"),
  () => import("@/components/scene6/CircularGallery"),
  () => import("@/components/movies/DomeGallery"),
  () => import("@/components/experience/UnifiedCanvas"),
];

let glbPreloadStarted = false;
let chunkPrefetchStarted = false;
let chunkPrefetchPromise = null;

/** Start GLB downloads as early as possible (drei cache). */
export function preloadExperienceGlbs() {
  if (glbPreloadStarted || typeof window === "undefined") return;
  glbPreloadStarted = true;
  useGLTF.preload(CAMERA_GLB_PATH);
  useGLTF.preload(EARTH_GLB_PATH);
  useGLTF.preload(DRAGON_GLB_PATH);
}

/** Warm HTTP cache for GLBs (parallel with drei loader). */
export function warmGlbHttpCache() {
  if (typeof window === "undefined") return;
  [CAMERA_GLB_PATH, EARTH_GLB_PATH, DRAGON_GLB_PATH].forEach((href) => {
    fetch(href, { cache: "force-cache" }).catch(() => {});
  });
}

/** Prefetch heavy JS chunks (React Bits + scene worlds) in parallel. */
export function prefetchExperienceChunks() {
  if (chunkPrefetchStarted) return chunkPrefetchPromise;
  chunkPrefetchStarted = true;

  chunkPrefetchPromise = Promise.allSettled(CHUNK_LOADERS.map((load) => load()));
  return chunkPrefetchPromise;
}

/** Full warm-up — call once on experience mount. */
export function warmExperienceAssets() {
  preloadExperienceGlbs();
  warmGlbHttpCache();
  if (typeof window !== "undefined") {
    void warmImageCache(MOVIE_IMAGES);
  }
  return prefetchExperienceChunks();
}

export const EXPERIENCE_GLB_PATHS = [CAMERA_GLB_PATH, EARTH_GLB_PATH, DRAGON_GLB_PATH];
