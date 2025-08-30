"use client";
import { useEffect, useRef } from "react";

export function useIntersection(onEnter: () => void, disabled = false) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onEnter()),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onEnter, disabled]);
  return ref;
}
