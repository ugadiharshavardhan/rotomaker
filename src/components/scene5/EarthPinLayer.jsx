"use client";

import { useMemo } from "react";
import { GLOBE_LOCATIONS } from "@/lib/sceneConfig";
import { useEarthGlobe } from "./EarthGlobeContext";
import { EarthLocationPin } from "./EarthLocationPin";
import { EarthConnectionArc } from "./EarthConnectionArc";

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

/** Directed office connections — India → USA, USA → Canada */
const CONNECTION_ROUTES = [
  ["India", "USA"],
  ["USA", "Canada"],
];

function findLocation(name) {
  return GLOBE_LOCATIONS.find((loc) => loc.name === name);
}

export function EarthPinLayer({ progress = 1 }) {
  const { surfaceRadius } = useEarthGlobe();

  const arcs = useMemo(
    () =>
      CONNECTION_ROUTES.map(([fromName, toName]) => ({
        from: findLocation(fromName),
        to: findLocation(toName),
        key: `${fromName}-${toName}`,
      })).filter((arc) => arc.from && arc.to),
    []
  );

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
          progress={progress}
        />
      ))}
      {arcs.map(({ from, to, key }, i) => (
        <EarthConnectionArc
          key={key}
          from={from}
          to={to}
          radius={surfaceRadius}
          progress={Math.max(0.15, progress)}
          index={i}
        />
      ))}
    </>
  );
}
