import { VFX_SERVICES } from "@/lib/servicesData";
import { getServicesItemIndex } from "@/lib/statsScroll";
import { smoothstep, clamp } from "@/lib/easing";

export const SERVICES_INTRO_END = 0.55;
export const SERVICES_WORDS_END = 0.55;

export const SERVICES_INTRO_WORD = { key: "intro", text: "We Don't Just Edit.", type: "intro" };

export function getServicesIntroBgOpacity(progress, overlayOpacity = 1, studioFade = 0) {
  const base = overlayOpacity * (1 - studioFade * 0.5);
  if (progress < 0.04) return 0;

  if (progress < SERVICES_INTRO_END) {
    const reveal = smoothstep(clamp((progress - 0.04) / 0.1));
    // Keep the intro line fully visible for most of its scroll window
    const fadeOut =
      progress < SERVICES_INTRO_END * 0.88
        ? 1
        : 1 - smoothstep(clamp((progress - SERVICES_INTRO_END * 0.88) / (SERVICES_INTRO_END * 0.12)));
    return base * reveal * fadeOut;
  }

  const exit = 1 - smoothstep(clamp((progress - SERVICES_INTRO_END) / 0.1));
  return base * exit;
}

export function getServicesCardsBgOpacity(progress, overlayOpacity = 1, studioFade = 0) {
  const base = overlayOpacity * (1 - studioFade * 0.5);
  if (progress < SERVICES_INTRO_END * 0.86) return 0;

  const fadeIn = smoothstep(clamp((progress - SERVICES_INTRO_END * 0.86) / 0.12));
  return base * fadeIn;
}

export function getServicesVisualState(progress) {
  const p = Math.min(0.999, Math.max(0, progress));

  if (p < SERVICES_INTRO_END) {
    return {
      phase: "intro",
      wordProgress: p / SERVICES_INTRO_END,
      orbitReveal: smoothstep(clamp(p / 0.08)),
      serviceIndex: 0,
      service: VFX_SERVICES[0],
      show3d: false,
    };
  }

  const local = (p - SERVICES_WORDS_END) / (1 - SERVICES_WORDS_END);
  const { index, segmentProgress } = getServicesItemIndex(local, VFX_SERVICES.length);
  const service = VFX_SERVICES[index];
  const hasImages = Boolean(service.before && service.after);

  return {
    phase: "cards",
    wordProgress: segmentProgress,
    orbitReveal: hasImages ? 0 : 1,
    serviceIndex: index,
    service,
    show3d: !hasImages,
  };
}
