import DirectionHover from "./Components/DirectionHover";
const steps = [
  {
    number: "01",
    title: "Discover Opportunities",
    description: "Explore college societies, discover recruitment drives, and find communities that match your interests and skills.",
  },
  {
    number: "02",
    title: "Show Your Potential",
    description: "Apply, attempt skill-based assessments, showcase your projects, and demonstrate what you can actually build.",
  },
  {
    number: "03",
    title: "Grow & Get Selected",
    description: "Complete practical challenges, receive mentor feedback, track your progress, and earn your place.",
  },
];

const features = [
  {
    title: "Skill-Based Recruitment",
    description: "Go beyond academic scores with practical assessments that highlight technical knowledge, creativity, and problem-solving.",
  },
  {
    title: "AI-Powered Insights",
    description: "Understand your strengths and areas for improvement through AI-assisted analysis backed by real performance evidence.",
  },
  {
    title: "Continuous Growth",
    description: "Track projects, deadlines, GitHub contributions, and mentor feedback throughout your recruitment journey.",
  },
  {
    title: "Transparent Selection",
    description: "Understand how your performance is evaluated through structured criteria and transparent scoring.",
  },
];

function LandingPage() {
  return (
    <div className="landing-wrapper">
      <main className="landing-container">
        <header className="landing-navbar">
          <a href="/" className="brand">
            Society<span>Select</span>
          </a>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </nav>
          <a href="/login" className="nav-cta">
            Get Started
          </a>
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

            <a href="/register" className="primary-button">
              Begin Your Journey
            </a>
          </div>
        </section>

        <section className="intro-section" id="how-it-works">
          <span className="eyebrow">YOUR JOURNEY STARTS HERE</span>
          <h2 className="hero-heading">
            <br />
            <DirectionHover title="Your talent is more than" />
            <br />
            <DirectionHover title="what's written on paper." />
          </h2>
          <p className="intro-description">
            SocietySelect brings students, mentors, and college
            societies together to make recruitment more meaningful,
            transparent, and focused on real-world abilities.
          </p>
          <br></br>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-section" id="features">
          <div className="feature-image">
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=85"
              alt="Student working on a development project"
            />
          </div>
          <div className="feature-card">
            <div className="feature-content">
              <span className="eyebrow light-eyebrow">
                WHAT MAKES US DIFFERENT
              </span>
              <h2>
                A better way to
                <br />
                discover potential.
              </h2>
              <div className="feature-list">
                {features.map((feature, index) => (
                  <div className="feature-item" key={feature.title}>
                    <span className="feature-arrow">→</span>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
        <section className="quote-section">
          <span className="eyebrow">OUR PHILOSOPHY</span>
          <h2>
            <br />
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
          <a href="/register" className="cta-light-button">
            Get Started Today
          </a>
        </section>
        <footer className="landing-footer">
          <a href="/" className="brand">
            Society<span>Select</span>
          </a>
          <p>Beyond Marks. Beyond Interviews. Discover Real Potential.</p>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="/login">Login</a>
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
