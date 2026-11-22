import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import DirectionHover from "./Components/DirectionHover";
import StepCoverflowCarousel from "./Components/StepCoverflowCarousel";

const steps = [
  {
    number: "01",
    title: "Discover Opportunities",
    description:
      "Explore college societies, discover recruitment drives, and find communities that match your interests and skills.",
  },
  {
    number: "02",
    title: "Show Your Potential",
    description:
      "Apply, attempt skill-based assessments, showcase your projects, and demonstrate what you can actually build.",
  },
  {
    number: "03",
    title: "Grow & Get Selected",
    description:
      "Complete practical challenges, receive mentor feedback, track your progress, and earn your place.",
  },
];

const features = [
  {
    title: "Skill-Based Recruitment",
    description:
      "Go beyond academic scores with practical assessments that highlight technical knowledge, creativity, and problem-solving.",
  },
  {
    title: "AI-Powered Insights",
    description:
      "Understand your strengths and areas for improvement through AI-assisted analysis backed by real performance evidence.",
  },
  {
    title: "Continuous Growth",
    description:
      "Track projects, deadlines, GitHub contributions, and mentor feedback throughout your recruitment journey.",
  },
  {
    title: "Transparent Selection",
    description:
      "Understand how your performance is evaluated through structured criteria and transparent scoring.",
  },
];

function LandingPage() {
  const featureRef = useRef(null);

  useEffect(() => {
    const section = featureRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.remove("animate-features");
          void section.offsetWidth;

          section.classList.add("animate-features");
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-wrapper">
      <main className="landing-container">
        <header className="landing-navbar">
          <Link to="/" className="brand">
            Society<span>Select</span>
          </Link>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </nav>
          <Link to="/login" className="nav-cta">
            Get Started
          </Link>
        </header>

        <section className="hero-section" id="home">
          <div className="hero-circle-wrapper" aria-hidden="true">
            <div className="hero-circle-dome"></div>
            <div className="hero-circle-rotator">
              <div className="hero-circle-ring ring-main"></div>
              <div className="hero-circle-ring ring-dashed"></div>
              <div className="hero-circle-ring ring-accent"></div>
            </div>
          </div>
          <div className="hero-content">
            <h1 className="animate-hero-title hero-heading">
              <DirectionHover title="Beyond Marks." />
              <br />
              <DirectionHover title="Beyond Interviews." />
              <br />
              <DirectionHover title="Discover Real Potential." />
            </h1>

            <Link to="/register" className="primary-button">
              Begin Your Journey
            </Link>
          </div>
        </section>

        <section className="intro-section" id="how-it-works">
          <span className="eyebrow">YOUR JOURNEY STARTS HERE</span>
          <h2 className="hero-heading">
            <DirectionHover title="Your talent is more than" />
            <br />
            <DirectionHover title="what's written on paper." />
          </h2>
          <p className="intro-description">
            SocietySelect brings students, mentors, and college
            societies together to make recruitment more meaningful,
            transparent, and focused on real-world abilities.
          </p>

          <StepCoverflowCarousel steps={steps} />
        </section>
        <section
          className="feature-section"
          id="features"
          ref={featureRef}
        >
          <div className="feature-header">
            <span className="eyebrow">WHAT MAKES US DIFFERENT</span>
            <h2>A better way to discover potential.</h2>
          </div>

          <div className="feature-infographic">
            <svg
              className="feature-path-svg"
              viewBox="0 0 1120 430"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                className="feature-main-path"
                d="M 55 95 H 125 C 185 95, 225 135, 225 195 V 255 C 225 325, 280 375, 345 375 C 410 375, 465 325, 465 255 V 195 C 465 125, 520 75, 585 75 C 650 75, 705 125, 705 195 V 255 C 705 325, 760 375, 825 375 C 890 375, 945 325, 945 255 V 165 C 945 115, 985 80, 1035 80 H 1075"
                stroke="#6b838a"
                strokeWidth="1.6"
                pathLength="100"
              />
              <path
                className="feature-dashed-loop"
                d="M 480 265 C 480 320, 528 360, 585 360 C 642 360, 690 320, 690 265"
                stroke="#6b838a"
                strokeWidth="1.4"
                strokeDasharray="6 6"
              />
              <polygon className="feature-loop-arrow" points="555,357 564,352 563,362" fill="#6ba9bc" />
              <polygon className="feature-loop-arrow" points="622,356 631,351 630,361" fill="#6ba9bc" />
              <polygon className="feature-end-arrow" points="1085,80 1072,73 1072,87" fill="#6b838a" />

              <circle className="feature-node node-1" cx="55" cy="95" r="16" fill="#6ba9bc" />
              <circle className="feature-node node-2" cx="222" cy="182" r="24" fill="#73aabd" />
              <circle className="feature-node node-3" cx="222" cy="252" r="38" fill="#6ba9bc" />
              <circle className="feature-node node-4" cx="465" cy="185" r="32" fill="#73aabd" />
              <circle className="feature-node node-5" cx="705" cy="252" r="34" fill="#6ba9bc" />
              <circle className="feature-node node-6" cx="945" cy="195" r="26" fill="#73aabd" />
            </svg>

            <div className="infographic-item item-1">
              <h3>{features[0].title}</h3>
              <p>{features[0].description}</p>
            </div>

            <div className="infographic-item item-2">
              <h3>{features[1].title}</h3>
              <p>{features[1].description}</p>
            </div>

            <div className="infographic-item item-3">
              <h3>{features[2].title}</h3>
              <p>{features[2].description}</p>
            </div>

            <div className="infographic-item item-4">
              <h3>{features[3].title}</h3>
              <p>{features[3].description}</p>
            </div>

            <div className="infographic-item item-5">
              <h3>Mentor-Backed Selection</h3>
              <p>
                Receive actionable feedback from society leads and seniors so
                every round becomes a real learning milestone.
              </p>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <span className="eyebrow">OUR PHILOSOPHY</span>
          <h2>
            Great potential cannot always
            <br />
            be measured by marks alone.
          </h2>
        </section>

        <section className="about-section" id="about">
          <div className="about-content">
            <span className="eyebrow">ABOUT SOCIETYSELECT</span>
            <h2>
              Your journey deserves
              <br />
              a more <em>meaningful</em>
              <br />
              beginning.
            </h2>
            <p>
              Traditional recruitment often focuses on examination
              scores and interviews. But talent goes beyond that.
              SocietySelect creates a complete ecosystem where
              students can showcase practical skills, work on projects,
              receive mentorship, and demonstrate consistent growth.
            </p>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=85"
              alt="College students learning and collaborating"
              loading="lazy"
            />
          </div>
        </section>

        <section className="final-cta">
          <span className="eyebrow light-eyebrow">
            YOUR NEXT CHAPTER STARTS NOW
          </span>
          <h2>
            Don't just apply.
            <br />
            Show what you can do.
          </h2>
          <p>
            Find your community. Build your skills. Make your potential count.
          </p>
          <Link to="/register" className="cta-light-button">
            Get Started Today
          </Link>
        </section>

        <footer className="landing-footer">
          <Link to="/" className="brand">
            Society<span>Select</span>
          </Link>
          <p>Beyond Marks. Beyond Interviews. Discover Real Potential.</p>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/login">Login</Link>
          </div>
          <span className="copyright">
            © 2026 SocietySelect. All rights reserved.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
