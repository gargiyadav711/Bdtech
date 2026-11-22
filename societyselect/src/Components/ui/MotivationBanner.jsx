import { useEffect, useState } from "react";
import { FiTarget, FiZap, FiAward, FiSmile, FiTrendingUp } from "react-icons/fi";
import { FaRocket, FaStar } from "react-icons/fa";
import "./MotivationBanner.css";

const INTERVAL = 4500;

const messages = [
  {
    icon: FiTarget,
    title: "Be clear, be you",
    text: "Interviewers remember honest answers far longer than perfect ones.",
  },
  {
    icon: FiZap,
    title: "Nerves mean you care",
    text: "Take a deep breath. That energy is excitement in disguise.",
  },
  {
    icon: FiTrendingUp,
    title: "Every interview is practice",
    text: "Each conversation makes the next one easier. Keep growing.",
  },
  {
    icon: FiSmile,
    title: "Smile and listen",
    text: "A calm smile and good listening say more than a rehearsed speech.",
  },
  {
    icon: FiAward,
    title: "You earned this spot",
    text: "You were shortlisted for a reason. Go show them why.",
  },
];

export default function MotivationBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      INTERVAL
    );
    return () => clearInterval(id);
  }, [paused]);

  const { icon: Icon, title, text } = messages[index];

  return (
    <div
      className="motivation-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* floating decorations */}
      <FaStar className="mb-spark mb-spark-1" />
      <FaStar className="mb-spark mb-spark-2" />
      <FaRocket className="mb-rocket" />

      <div className="mb-icon-wrap" key={`icon-${index}`}>
        <Icon />
      </div>

      <div className="mb-content" key={`text-${index}`}>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <div className="mb-dots">
        {messages.map((_, i) => (
          <button
            key={i}
            aria-label={`Show message ${i + 1}`}
            className={`mb-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {!paused && (
        <div
          className="mb-progress"
          key={`bar-${index}`}
          style={{ animationDuration: `${INTERVAL}ms` }}
        />
      )}
    </div>
  );
}