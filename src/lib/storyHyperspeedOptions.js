/** Hyperspeed config for About / Why — original magenta + cyan light trails. */
import { hyperspeedPresets } from "@/components/about/HyperSpeedPresets";

const { colors, ...rest } = hyperspeedPresets.one;

export const STORY_HYPERSPEED_OPTIONS = {
  ...rest,
  lanesPerRoad: 4,
  colors: {
    ...colors,
    background: 0x030303,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};
