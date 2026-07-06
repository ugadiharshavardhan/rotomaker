"use client";

import { useEffect } from "react";
import { SERVICE_IMAGE_URLS } from "@/lib/servicesData";

export function ServiceImagePreloader() {
  useEffect(() => {
    SERVICE_IMAGE_URLS.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {SERVICE_IMAGE_URLS.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" decoding="async" fetchPriority="low" />
      ))}
    </div>
  );
}
