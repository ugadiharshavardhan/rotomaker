"use client";

import { GLOBE_LOCATIONS } from "@/lib/sceneConfig";
import { EarthLocationPin } from "./EarthLocationPin";

const PIN_COLORS = {
  India: "#c77dff",
  USA: "#b388ff",
  Canada: "#9575cd",
};

const DISPLAY_LABELS = {
  India: "INDIA",
  USA: "USA",
  Canada: "CANADA",
};

export function EarthPinLayer({ progress = 1 }) {
  // Pins stay visible once the globe has started approaching
  const pinProgress = Math.max(progress, progress > 0.05 ? 0.45 : 0);

  return (
    <>
      {GLOBE_LOCATIONS.map((loc, index) => (
        <EarthLocationPin
          key={loc.name}
          latitude={loc.lat}
          longitude={loc.lng}
          name={DISPLAY_LABELS[loc.name] ?? loc.name}
          mapUrl={loc.mapUrl}
          color={PIN_COLORS[loc.name] ?? "#ffffff"}
          index={index}
          progress={pinProgress}
        />
      ))}
    </>
  );
}
