import { VFX_SERVICES } from "@/lib/servicesData";
import { getActiveItemIndex } from "@/lib/portfolioData";

export const SERVICES_INTRO_END = 0.1;
export const SERVICES_WORDS_END = 0.1;

export const SERVICES_INTRO_WORD = { key: "intro", text: "We Don't Just Edit.", type: "intro" };

export function getServicesIntroBgOpacity(progress, overlayOpacity = 1, studioFade = 0) {
  const base = overlayOpacity * (1 - studioFade * 0.5);
  if (progress < 0.02) return 0;

  if (progress < SERVICES_INTRO_END) {
    const reveal = Math.min(1, (progress - 0.02) / 0.04);
    const fadeOut =
      progress < SERVICES_INTRO_END * 0.82
        ? 1
        : 1 - (progress - SERVICES_INTRO_END * 0.82) / (SERVICES_INTRO_END * 0.18);
    return base * reveal * fadeOut;
  }

  const exit = Math.max(0, 1 - (progress - SERVICES_INTRO_END) / 0.04);
  return base * exit;
}

export function getServicesVisualState(progress) {
  const p = Math.min(0.999, Math.max(0, progress));

  if (p < SERVICES_INTRO_END) {
    return {
      phase: "intro",
      wordProgress: p / SERVICES_INTRO_END,
      orbitReveal: Math.min(1, p / 0.06),
      serviceIndex: 0,
      service: VFX_SERVICES[0],
      show3d: false,
    };
  }

  const local = (p - SERVICES_WORDS_END) / (1 - SERVICES_WORDS_END);
  const { index, segmentProgress } = getActiveItemIndex(local, VFX_SERVICES.length);
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
