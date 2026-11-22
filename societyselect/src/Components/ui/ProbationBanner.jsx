import { useEffect, useMemo, useState } from "react";
import { FiAward, FiClock, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import { FaFlag, FaRocket, FaStar } from "react-icons/fa";
import "./ProbationBanner.css";

const INTERVAL = 5000;

const STEPS = [
  { key: "APPLICANT", label: "Applicant" },
  { key: "ON_PROBATION", label: "On Probation" },
  { key: "SELECTED", label: "Selected" },
];

const BASE_MESSAGES = [
  { icon: FiTrendingUp, text: "Every task you finish is a step closer to the society." },
  { icon: FiTarget, text: "Small wins add up. Consistency beats speed during probation." },
  { icon: FiZap, text: "Ask for feedback early. Mentors notice students who keep improving." },
  { icon: FiAward, text: "Your scores show where you are today, not where you can reach." },
];

export default function ProbationBanner({ status = "ON_PROBATION", daysLeft }) {
  // The "days to go" message only appears when a number of days is provided
  const messages = useMemo(
    () =>
      typeof daysLeft === "number" && daysLeft > 0
        ? [
            ...BASE_MESSAGES,
            { icon: FiClock, text: `${daysLeft} days to go. Make each one count.` },
          ]
        : BASE_MESSAGES,
    [daysLeft]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, [paused, messages.length]);

  const { icon: Icon, text } = messages[index % messages.length];

  const lastStep = STEPS.length - 1;
  const currentStep = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );
  const fill = (currentStep / lastStep) * 100;

  const stateOf = (i) =>
    currentStep === lastStep || i < currentStep
      ? "done"
      : i === currentStep
      ? "current"
      : "upcoming";

  return (
    <div
      className="pb-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <FaStar className="pb-spark pb-spark-1" aria-hidden="true" />
      <FaStar className="pb-spark pb-spark-2" aria-hidden="true" />

      <div className="pb-main">
        <div className="pb-icon" key={`icon-${index}`}>
          <Icon />
        </div>

        <p className="pb-text" key={`text-${index}`}>
          {text}
        </p>

        <div className={`pb-dots${paused ? " paused" : ""}`}>
          {messages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show message ${i + 1}`}
              className={`pb-dot${i === index ? " active" : ""}`}
              style={{ "--interval": `${INTERVAL}ms` }}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>

      {/* Milestone track: rocket climbs to the student's current stage */}
      <div className="pb-track-wrap">
        <div className="pb-track" style={{ "--fill": `${fill}%` }}>
          <span className="pb-track-fill" />

          {STEPS.map((step, i) => (
            <span
              key={step.key}
              className={`pb-node ${stateOf(i)}`}
              style={{
                left: `${(i / lastStep) * 100}%`,
                animationDelay: `${300 + i * 300}ms`,
              }}
            />
          ))}

          <FaFlag className="pb-flag" aria-hidden="true" />
          <span className="pb-rocket-pos">
            <FaRocket className="pb-rocket" aria-hidden="true" />
          </span>
        </div>

        <div className="pb-labels">
          {STEPS.map((step, i) => {
            const position =
              i === 0
                ? { left: 0 }
                : i === lastStep
                ? { right: 0 }
                : { left: `${(i / lastStep) * 100}%`, transform: "translateX(-50%)" };
            return (
              <span key={step.key} className={stateOf(i)} style={position}>
                {step.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}