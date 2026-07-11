/**
 * Fog-driven intro — volumetric cloud sequence + characters from /public/characters.
 */

export const HERO_STORY_BG = "#000000";
export const HERO_STORY_FOG = "#c8c8c8";
export const HERO_STORY_LIGHT = "#ffffff";

/** Bump when replacing PNGs so GPU / browser caches pick up new art. */
const CHAR_V = "v3";

function charImg(file) {
  return `/characters/${file}?${CHAR_V}`;
}

/**
 * Must match files in /public/characters exactly.
 */
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
    image: charImg("spiderman.png"),
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
    image: charImg("blackpanther.png"),
  },
  {
    id: "aquaman",
    name: "Aquaman",
    studio: "Warner Bros.",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "right",
    rimCool: "#4ec4ff",
    rimWarm: "#f0a060",
    image: charImg("aquaman.png"),
  },
  {
    id: "batman",
    name: "Batman",
    studio: "Warner Bros.",
    label: "Worked On",
    credits: ["CG Cleanup", "Compositing", "Roto", "Paint"],
    side: "left",
    rimCool: "#8aa0c8",
    rimWarm: "#d4a060",
    image: charImg("batman.png"),
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
    image: charImg("flashman.png"),
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
    image: charImg("groot.png"),
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
    image: charImg("power.png"),
  },
];

export const HERO_CHARACTER_IMAGES = HERO_CHARACTERS.map((c) => c.image);
export const HERO_BEATS = {
  /** Opening 360° cinema wall + brand (replaces flat black hold) */
  holdEnd: 0.045,
  /** Wall fades; fog rolls in toward first character */
  windEnd: 0.1,
  /** Scroll budget per character (7 figures) */
  characterSpan: 0.106,
  /** Cinema wall returns after the last reveal */
  finalStart: 0.842,
};

/** Body uncover — slower eyes→body so each character has time to land. */
export function getBodyReveal(characterLocal) {
  if (characterLocal < 0.12) return 0;
  if (characterLocal < 0.58) return (characterLocal - 0.12) / 0.46;
  if (characterLocal < 0.8) return 1;
  return Math.max(0, 1 - (characterLocal - 0.8) / 0.2);
}

/**
 * Clear a wider corridor around the character so the standee stays readable.
 * Ambient fog remains at the edges.
 */
export function getFogParting(characterLocal) {
  if (characterLocal < 0.08) return (characterLocal / 0.08) * 0.28;
  if (characterLocal < 0.58) {
    return 0.28 + ((characterLocal - 0.08) / 0.5) * 0.52;
  }
  return Math.max(0, 0.8 - ((characterLocal - 0.58) / 0.42) * 0.8);
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
      fogDensity: 0,
      fogApproach: 0,
      wind: 0.08,
      parting: 0,
      bodyReveal: 0,
      brandX: 0,
      brandOpacity: 1,
      brandInFog: 0,
      creditsOpacity: 0,
      lightBehind: 0.35,
      cameraPush: 0,
      bodyX: 0,
      bodySide: 0,
      finaleLineup: false,
      /** Post-load hero is the 360° wall, not a flat black card */
      cinemaOpen: 1,
    };
  }

  if (p < windEnd) {
    const local = (p - holdEnd) / (windEnd - holdEnd);
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
      brandOpacity: Math.max(0, 1 - local * 1.15),
      brandInFog: local * 0.5,
      creditsOpacity: 0,
      lightBehind: 0.3 + local * 0.35,
      cameraPush: local * 0.1,
      bodyX: 0,
      bodySide: 0,
      finaleLineup: false,
      cinemaOpen: Math.max(0, 1 - local * 1.35),
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
    const creditsOpacity =
      characterLocal > 0.42 && characterLocal < 0.78
        ? Math.min(1, Math.max(0, (characterLocal - 0.42) / 0.12)) *
          Math.min(1, Math.max(0, (0.78 - characterLocal) / 0.1))
        : 0;

    const brandOpacity =
      characterLocal < 0.08
        ? Math.max(0, 0.3 * (1 - characterLocal / 0.08))
        : characterLocal > 0.88
          ? Math.min(0.35, ((characterLocal - 0.88) / 0.12) * 0.35)
          : 0;

    return {
      phase: "character",
      local: characterLocal,
      characterIndex: index,
      characterLocal,
      fogDensity: 0,
      fogApproach: 0.35,
      wind: 0.2,
      parting: 1,
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
      cinemaOpen: 0,
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
    cinemaOpen: Math.min(1, Math.max(0, (local - 0.02) / 0.35)),
  };
}
