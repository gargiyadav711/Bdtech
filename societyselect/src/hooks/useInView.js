import { useEffect, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const shouldShowImmediately = () =>
  prefersReducedMotion() ||
  (typeof window !== "undefined" && !("IntersectionObserver" in window));

export default function useInView(
  ref,
  { threshold = 0.15, rootMargin = "0px 0px -6% 0px" } = {},
) {
  const [hasEntered, setHasEntered] = useState(shouldShowImmediately);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasEntered || prefersReducedMotion()) return undefined;
    if (!("IntersectionObserver" in window)) return undefined;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event) => {
      if (event.matches) setHasEntered(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setHasEntered(true);
        observer.unobserve(element);
      },
      { threshold, rootMargin },
    );

    motionPreference.addEventListener?.("change", handleMotionPreference);
    observer.observe(element);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener?.("change", handleMotionPreference);
    };
  }, [hasEntered, ref, rootMargin, threshold]);

  return hasEntered;
}
