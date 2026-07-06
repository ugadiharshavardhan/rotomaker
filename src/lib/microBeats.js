export const MICRO_EFFECTS = [
  "fade",
  "rotate",
  "dolly",
  "particles",
  "reveal",
  "mask",
  "stretch",
  "glass",
  "noise",
  "depth",
];

export function getMicroBeatState(globalProgress, scrollVh = 1600) {
  const totalBeats = scrollVh / 10;
  const float = globalProgress * totalBeats;
  const index = Math.floor(float);
  const beatProgress = float - index;
  const effect = MICRO_EFFECTS[index % MICRO_EFFECTS.length];

  return { index, beatProgress, effect, float };
}
