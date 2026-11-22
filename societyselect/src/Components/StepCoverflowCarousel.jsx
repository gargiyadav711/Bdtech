import { useState } from "react";
import "./StepCoverflowCarousel.css";

function StepCoverflowCarousel({ steps }) {
  const [activeIndex, setActiveIndex] = useState(1); // Start with 02 centered, or 0 for 01

  const total = steps.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const getCardPositionClass = (index) => {
    if (index === activeIndex) return "is-active";

    // Calculate shortest signed offset in circular list (-1 = left, +1 = right)
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    if (diff < 0) return "is-left";
    return "is-right";
  };

  return (
    <div
      className="coverflow-wrapper"
      role="region"
      aria-label="How SocietySelect works steps carousel"
    >
      <div className="coverflow-stage">
        {steps.map((step, index) => {
          const posClass = getCardPositionClass(index);
          const isActive = posClass === "is-active";

          return (
            <article
              key={step.number}
              className={`coverflow-card ${posClass}`}
              onClick={() => !isActive && setActiveIndex(index)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveIndex(index);
                }
              }}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="coverflow-badge">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          );
        })}
      </div>

      <div className="coverflow-controls">
        <button
          type="button"
          className="coverflow-btn"
          onClick={handlePrev}
          aria-label="Previous step"
        >
          ←
        </button>

        <div className="coverflow-dots" role="tablist" aria-label="Select step">
          {steps.map((step, index) => (
            <button
              key={step.number}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Step ${step.number}: ${step.title}`}
              className={`coverflow-dot ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="coverflow-btn"
          onClick={handleNext}
          aria-label="Next step"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default StepCoverflowCarousel;