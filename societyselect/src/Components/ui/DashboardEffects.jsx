import { Children, cloneElement, isValidElement, useRef } from "react";
import useCountUp from "../../hooks/useCountUp";
import useInView from "../../hooks/useInView";
import "./DashboardEffects.css";

export function Reveal({
  as: Element = "div",
  children,
  className = "",
  index = 0,
  ...props
}) {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const delay = `${Math.min(index, 5) * 70}ms`;

  return (
    <Element
      ref={ref}
      className={`dashboard-reveal${isInView ? " is-in-view" : ""}${className ? ` ${className}` : ""}`}
      style={{ "--reveal-delay": delay }}
      {...props}
    >
      {children}
    </Element>
  );
}

export function CountUp({ as: Element = "span", value, ...props }) {
  const { ref, displayValue } = useCountUp(value);
  return <Element ref={ref} {...props}>{displayValue}</Element>;
}

const renderBlurredWords = (children, wordIndex) =>
  Children.map(children, (child) => {
    if (typeof child === "string") {
      return child.split(/(\s+)/).map((part) => {
        if (!part.trim()) return part;
        const index = wordIndex.current;
        wordIndex.current += 1;
        return (
          <span
            className="blur-text-word"
            key={`word-${index}`}
            style={{ "--blur-delay": `${index * 90}ms` }}
          >
            {part}
          </span>
        );
      });
    }

    if (isValidElement(child) && child.props.children) {
      return cloneElement(child, {
        children: renderBlurredWords(child.props.children, wordIndex),
      });
    }

    return child;
  });

export function BlurText({ children, className = "", ...props }) {
  const wordIndex = { current: 0 };
  return (
    <h1 className={`blur-text${className ? ` ${className}` : ""}`} {...props}>
      {renderBlurredWords(children, wordIndex)}
    </h1>
  );
}

export function ShinyText({ as: Element = "span", children, className = "", ...props }) {
  return (
    <Element className={`shiny-text${className ? ` ${className}` : ""}`} {...props}>
      {children}
    </Element>
  );
}

export function SpotlightCard({
  as: Element = "div",
  children,
  className = "",
  ...props
}) {
  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - bounds.top}px`);
  };

  return (
    <Element
      className={`spotlight-card${className ? ` ${className}` : ""}`}
      onPointerMove={handlePointerMove}
      {...props}
    >
      {children}
    </Element>
  );
}

export function Magnet({ as: Element = "a", children, className = "", ...props }) {
  const ref = useRef(null);

  const handlePointerMove = (event) => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;
    event.currentTarget.style.transform = `translate(${offsetX * 0.18}px, ${offsetY * 0.3}px)`;
  };

  const resetPosition = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Element
      ref={ref}
      className={`magnet${className ? ` ${className}` : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      {...props}
    >
      {children}
    </Element>
  );
}
