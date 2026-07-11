/**
 * Fog-driven intro — volumetric cloud sequence + 5 characters from /public/characters.
 */

export const HERO_STORY_BG = "#000000";
export const HERO_STORY_FOG = "#c8c8c8";
export const HERO_STORY_LIGHT = "#ffffff";

export const HERO_CHARACTERS = [
  {
    id: "spiderman",
    name: "Spider-Man",
    studio: "Marvel Studios",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "right",
    rimCool: "#6ea8ff",
    rimWarm: "#ff9a5c",
    image: "/characters/spiderman.png",
  },
  {
    id: "blackpanther",
    name: "Black Panther",
    studio: "Marvel Studios",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "left",
    rimCool: "#7eb6ff",
    rimWarm: "#e8a060",
    image: "/characters/blackpanther.png",
  },
  {
    id: "flashman",
    name: "The Flash",
    studio: "Warner Bros.",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "right",
    rimCool: "#5c9dff",
    rimWarm: "#ff7a3d",
    image: "/characters/flashman.png",
  },
  {
    id: "groot",
    name: "Groot",
    studio: "Marvel Studios",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "left",
    rimCool: "#8ec5ff",
    rimWarm: "#d4a574",
    image: "/characters/groot.png",
  },
  {
    id: "power",
    name: "Power",
    studio: "Feature Film",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "right",
    rimCool: "#9bb8ff",
    rimWarm: "#ffb070",
    image: "/characters/power.png",
  },
];

export const HERO_BEATS = {
  /** Clear black + ROTOMAKER (no fog yet) — stay readable after load */
  holdEnd: 0.08,
  /** Fog rolls in from depth; title leaves center */
  windEnd: 0.18,
  characterSpan: 0.134,
  /** Lineup appears before the camera section */
  finalStart: 0.85,
};

/** Body uncover — stays visible through the beat so scroll-back always shows the figure. */
export function getBodyReveal(characterLocal) {
  if (characterLocal < 0.06) return characterLocal / 0.06;
  return 1;
}

/**
 * Narrow corridor only — never wipe the whole screen clear of fog.
 * Max parting ~0.55 so ambient fog always remains.
 */
export function getFogParting(characterLocal) {
  if (characterLocal < 0.08) return (characterLocal / 0.08) * 0.2;
  if (characterLocal < 0.55) {
    return 0.2 + ((characterLocal - 0.08) / 0.47) * 0.35;
  }
  // Fog closes back in
  return Math.max(0, 0.55 - ((characterLocal - 0.55) / 0.45) * 0.55);
}

export function getHeroStoryState(progress) {
  const p = Math.min(1, Math.max(0, progress));
  const { holdEnd, windEnd, finalStart } = HERO_BEATS;
  const count = HERO_CHARACTERS.length;

  if (p < holdEnd) {
    return {
      phase: "unknown",
      local: p / Math.max(holdEnd, 0.0001),
      characterIndex: -1,
      characterLocal: 0,
      // Black screen + clear brand — fog arrives on scroll
      fogDensity: 0,
      fogApproach: 0,
      wind: 0.05,
      parting: 0,
      bodyReveal: 0,
      brandX: 0,
      brandOpacity: 1,
      brandInFog: 0,
      creditsOpacity: 0,
      lightBehind: 0.25,
      cameraPush: 0,
      bodyX: 0,
      bodySide: 0,
      finaleLineup: false,
    };
  }

  if (p < windEnd) {
    const local = (p - holdEnd) / (windEnd - holdEnd);
    // Ease fog in from infinity
    const approach = Math.min(1, local * local * 0.35 + local * 0.65);
    return {
      phase: "wind",
      local,
      characterIndex: -1,
      characterLocal: 0,
      fogDensity: 0.55 + local * 0.2,
      fogApproach: approach,
      wind: 0.15 + local * 0.7,
      parting: local * 0.15,
      bodyReveal: 0,
      brandX: -local * 0.92,
      brandOpacity: Math.max(0, 1 - local * 1.1),
      brandInFog: local * 0.5,
      creditsOpacity: 0,
      lightBehind: 0.3 + local * 0.35,
      cameraPush: local * 0.1,
      bodyX: 0,
      bodySide: 0,
      finaleLineup: false,
    };
  }

  if (p < finalStart) {
    const span = HERO_BEATS.characterSpan;
    const t = p - windEnd;
    const index = Math.min(count - 1, Math.floor(t / span));
    const characterLocal = (t - index * span) / span;
    const character = HERO_CHARACTERS[index];
    const sideSign = character.side === "right" ? 1 : -1;
    const bodyReveal = getBodyReveal(characterLocal);
    const parting = getFogParting(characterLocal);
    const creditsOpacity =
      characterLocal > 0.36 && characterLocal < 0.72
        ? Math.min(1, Math.max(0, (characterLocal - 0.36) / 0.1)) *
          Math.min(1, Math.max(0, (0.72 - characterLocal) / 0.08))
        : 0;

    const brandOpacity =
      characterLocal < 0.08
        ? Math.max(0, 0.3 * (1 - characterLocal / 0.08))
        : characterLocal > 0.88
          ? Math.min(0.35, (characterLocal - 0.88) / 0.12 * 0.35)
          : 0;

    return {
      phase: "character",
      local: characterLocal,
      characterIndex: index,
      characterLocal,
      fogDensity: 0.7,
      fogApproach: 1,
      wind: 0.45 + parting * 0.3,
      parting,
      bodyReveal,
      brandX: -0.92,
      brandOpacity,
      brandInFog: 0.4,
      creditsOpacity,
      lightBehind: 0.5 + bodyReveal * 0.3,
      cameraPush: Math.sin(Math.min(1, bodyReveal) * Math.PI) * 0.4,
      bodyX: sideSign * 2.35,
      bodySide: sideSign,
      finaleLineup: false,
    };
  }

  const local = (p - finalStart) / (1 - finalStart);
  return {
    phase: "finale",
    local,
    characterIndex: -1,
    characterLocal: local,
    fogDensity: 0.55,
    fogApproach: Math.min(1, local * 1.2),
    wind: 0.35 + local * 0.25,
    parting: 0.2,
    bodyReveal: 0,
    brandX: 0,
    brandOpacity: Math.min(1, Math.max(0, (local - 0.02) / 0.2)),
    brandInFog: 0,
    creditsOpacity: 0,
    lightBehind: 0.6 + local * 0.3,
    cameraPush: 0,
    bodyX: 0,
    bodySide: 0,
    finaleLineup: true,
  };
}
