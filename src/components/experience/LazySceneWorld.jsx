"use client";

import { lazy, Suspense, useEffect, useState } from "react";

/**
 * Keep a world mounted after first visit so scrolling back/forward
 * doesn't pay chunk + GPU compile cost again.
 */
export function LazyWorld({ active, children }) {
  const [warmed, setWarmed] = useState(active);

  useEffect(() => {
    if (active) setWarmed(true);
  }, [active]);

  if (!active && !warmed) return null;

  return (
    <Suspense fallback={null}>
      <group visible={active}>{children}</group>
    </Suspense>
  );
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
