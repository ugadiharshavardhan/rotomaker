"use client";

import { createContext, useContext } from "react";

const EarthGlobeContext = createContext(null);

/** Surface radius multiplier — lifts pins slightly above the mesh to avoid z-fighting. */
export const EARTH_PIN_SURFACE_OFFSET = 1.04;

export function EarthGlobeProvider({ radius, children }) {
  const value = {
    radius,
    surfaceRadius: radius * EARTH_PIN_SURFACE_OFFSET,
  };

  return <EarthGlobeContext.Provider value={value}>{children}</EarthGlobeContext.Provider>;
}

export function useEarthGlobe() {
  const ctx = useContext(EarthGlobeContext);
  if (!ctx) {
    throw new Error("useEarthGlobe must be used within EarthGlobeProvider");
  }
  return ctx;
}
