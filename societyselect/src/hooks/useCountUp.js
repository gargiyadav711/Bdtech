import { useEffect, useRef, useState } from "react";
import useInView from "./useInView";

const integerPattern = /[+-]?\d+/g;

const formatAtProgress = (value, progress) => {
  return value.replace(integerPattern, (match) => {
    const target = Number(match);
    const prefix = match.startsWith("+") ? "+" : match.startsWith("-") ? "-" : "";
    const current = Math.round(Math.abs(target) * progress);
    return `${prefix}${current}`;
  });
};

const hasReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function useCountUp(value, duration = 1400) {
  const source = String(value);
  const ref = useRef(null);
  const isInView = useInView(ref);
  const [displayValue, setDisplayValue] = useState(() =>
    hasReducedMotion() ? source : formatAtProgress(source, 0),
  );

  useEffect(() => {
    let frameId;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = (event) => {
      if (!event.matches) return;
      cancelAnimationFrame(frameId);
      setDisplayValue(source);
    };

    motionPreference.addEventListener?.("change", handleMotionPreference);
    if (isInView && !motionPreference.matches) {
      const start = performance.now();
      const update = (timestamp) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setDisplayValue(formatAtProgress(source, easedProgress));
        if (progress < 1) frameId = requestAnimationFrame(update);
      };

      frameId = requestAnimationFrame(update);
    } else if (motionPreference.matches) {
      frameId = requestAnimationFrame(() => setDisplayValue(source));
    }

    return () => {
      cancelAnimationFrame(frameId);
      motionPreference.removeEventListener?.("change", handleMotionPreference);
    };
  }, [duration, isInView, source]);

  return { ref, displayValue };
}
