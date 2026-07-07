"use client";

import { lazy, Suspense } from "react";

export function LazyWorld({ active, children }) {
  if (!active) return null;
  return <Suspense fallback={null}>{children}</Suspense>;
}

export function makeLazyWorld(loader) {
  const Component = lazy(loader);
  return function LazySceneWorld({ active, ...props }) {
    return (
      <LazyWorld active={active}>
        <Component {...props} />
      </LazyWorld>
    );
  };
}
