"use client";

import { useEffect } from "react";

// Locks page scroll while mounted (used for the fixed map view).
export default function ScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  return null;
}
