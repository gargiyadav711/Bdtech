import { useCallback, useEffect, useRef, useState } from "react";
import {
  BlurText,
  CountUp,
  Magnet,
  Reveal,
  ShinyText,
  SpotlightCard,
} from "../../components/ui/DashboardEffects";
import "./StudentDashboard.css";

const dashboardData = {
  student: {
    name: "Ashutosh",
    role: "Probationer & Member",
    performance: 86,
    cohortRank: "Top 15%",
    milestone: "Full Time",
    deadline: "30th Dec",
  },
  overview: {
    applicationStatus: "In Review",
    statusDescription:
      "Your profile is under evaluation. You will be notified soon about the next steps in your journey.",
    examinationScore: 82,
    tasksCompleted: 8,
    totalTasks: 12,
    previousPerformance: 82,
    performanceChange: "+4%",
    performanceSummary: "Steady, upward momentum",
    bestQuarter: "Your best quarter yet.",
    performanceDescription: "Consistent growth across all sections this year.",
    projectCompletion: 84,
    productivityScore: "+24",
  },
  journey: [
    { number: "1", name: "Application", detail: "Your application was successfully received", state: "complete" },
    { number: "2", name: "Online Examination", detail: "Complete with 82% score", state: "complete" },
    { number: "3", name: "Interview", detail: "Scheduled for next month", state: "complete" },
    { number: "4", name: "Probation", detail: "4 months to build your skills", state: "current" },
    { number: "5", name: "Final Selection", detail: "Your dedication pays off", state: "upcoming" },
  ],
  monthlyTrend: [
    { month: "Jan", value: 64 },
    { month: "Feb", value: 69 },
    { month: "Mar", value: 74 },
    { month: "Apr", value: 79 },
    { month: "May", value: 83 },
    { month: "Jun", value: 86 },
  ],
  tasks: [
    {
      id: "readme",
      title: "Upload project README",
      description: "Add a detailed README file to your repository.",
      date: "16 Nov",
      priority: "High",
    },
    {
      id: "interview",
      title: "Prepare for your review",
      description: "Review your recent work and practice sharing your impact.",
      date: "20 Nov",
      priority: "Medium",
    },
    {
      id: "collaboration",
      title: "Peer collaboration review",
      description: "Share feedback on your teammates' recent contributions.",
      date: "24 Nov",
      priority: "Medium",
    },
    {
      id: "communication",
      title: "Complete communication quiz",
      description: "Test your communication and teamwork skills.",
      date: "28 Nov",
      priority: "Low",
    },
  ],
  activity: [
    { title: "Interview completed", detail: "Today, 10:30 AM" },
    { title: "Evaluation updated", detail: "Yesterday, 4:12 PM" },
    { title: "Project milestone submitted", detail: "9 Nov, 2:05 PM" },
    { title: "Peer review received", detail: "7 Nov, 11:24 AM" },
    { title: "Probation started", detail: "1 Nov, 9:00 AM" },
  ],
  skills: [
    { name: "React.js", score: 87, type: "percent" },
    { name: "JavaScript", score: 81, type: "percent" },
    { name: "Problem solving", score: 88, type: "percent" },
    { name: "Communication", score: 77, type: "percent" },
    { name: "Teamwork", score: 87, type: "percent" },
    { name: "GitHub contributions", score: 89, type: "points" },
  ],
  recommendations: [
    { taskId: "interview", text: "Practice mock interviews to feel ready for your review." },
    { taskId: "readme", text: "Add a clear README to showcase your project." },
    { taskId: "collaboration", text: "Keep building your collaboration skills through peer feedback." },
  ],
  insight: {
    heading: "Your next step towards growth",
    quote:
      "Your technical performance is improving. Focus on completing pending tasks and strengthening your project contributions.",
  },
};

const StudentDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navbarLinksRef = useRef(null);
  const { student, overview } = dashboardData;
  const chartCoordinates = dashboardData.monthlyTrend.map((point, index) => ({
    ...point,
    x: 30 + (index / Math.max(dashboardData.monthlyTrend.length - 1, 1)) * 368,
    y: 102 - (point.value - 60) * 2.8,
  }));
  const chartPoints = chartCoordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const chartArea = `M${chartCoordinates[0].x},102 L${chartPoints} L${chartCoordinates.at(-1).x},102 Z`;

  const closeMenu = () => setIsMenuOpen(false);
  const moveNavIndicator = useCallback((link) => {
    const nav = navbarLinksRef.current;
    if (!nav || !link) return;
    const mobile = window.matchMedia("(max-width: 700px)").matches;
    setIndicatorStyle({
      left: link.offsetLeft,
      top: link.offsetTop + link.offsetHeight - (mobile ? 9 : 22),
      width: link.offsetWidth,
    });
  }, []);
  const handleNavClick = (label) => {
    setActiveNav(label);
    closeMenu();
  };

  useEffect(() => {
    const activeLink = navbarLinksRef.current?.querySelector(`[data-nav="${activeNav}"]`);
    if (activeLink) moveNavIndicator(activeLink);
    const handleResize = () => {
      const currentLink = navbarLinksRef.current?.querySelector(`[data-nav="${activeNav}"]`);
      if (currentLink) moveNavIndicator(currentLink);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeNav, isMenuOpen, moveNavIndicator]);

  return (
    <main className="student-dashboard">
      <header className="dashboard-navbar">
        <a className="navbar-brand" href="/student/dashboard" aria-label="SocietySelect AI home">
          <span className="brand-name">SocietySelect</span>
          <span className="brand-ai">AI</span>
        </a>

        <nav
          ref={navbarLinksRef}
          id="dashboard-navigation"
          className={`navbar-links${isMenuOpen ? " is-open" : ""}`}
          aria-label="Main navigation"
          onMouseLeave={() => {
            const activeLink = navbarLinksRef.current?.querySelector(`[data-nav="${activeNav}"]`);
            if (activeLink) moveNavIndicator(activeLink);
          }}
        >
          <a
            href="/student/dashboard"
            className={`nav-link${activeNav === "Dashboard" ? " active" : ""}`}
            data-nav="Dashboard"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Dashboard")}
          >
            Dashboard
          </a>
          <a
            href="/student/application-tracking"
            className={`nav-link${activeNav === "Applications" ? " active" : ""}`}
            data-nav="Applications"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Applications")}
          >
            Applications
          </a>
          <a
            href="/student/performance"
            className={`nav-link${activeNav === "Performance" ? " active" : ""}`}
            data-nav="Performance"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Performance")}
          >
            Performance
          </a>
          <a
            href="/student/settings"
            className={`nav-link${activeNav === "Settings" ? " active" : ""}`}
            data-nav="Settings"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Settings")}
          >
            Settings
          </a>
          <a
            href="/student/notifications"
            className={`nav-link${activeNav === "Notifications" ? " active" : ""}`}
            data-nav="Notifications"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Notifications")}
          >
            Notifications
          </a>
          <span
            className="nav-indicator"
            aria-hidden="true"
            style={indicatorStyle}
          />
        </nav>

        <div className="navbar-actions">
          <a className="navbar-notifications" href="/student/notifications" aria-label="Notifications">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          </a>
          <a className="navbar-profile" href="/student/profile" aria-label={`Profile for ${student.name}`}>
            <span className="navbar-avatar" aria-hidden="true">{student.name.charAt(0)}</span>
          </a>
        </div>

        <button
          className="navbar-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <section className="dashboard-hero" aria-labelledby="student-hero-title">
        <p className="hero-eyebrow"><ShinyText>Student Portal</ShinyText></p>
        <BlurText className="hero-title" id="student-hero-title">
          Your Journey. <em>Your Skills.</em>
          <br />
          Your Opportunity.
        </BlurText>
        <p className="hero-description">
          Track your progress, showcase your skills and take the next step
          towards joining your dream society.
        </p>
        <div className="hero-actions">
          <Magnet className="hero-button" href="#upcoming-tasks">Continue Your Journey</Magnet>
          <Magnet className="hero-button" href="/student/profile">View My Profile</Magnet>
        </div>
      </section>

      <Reveal as="div" index={0} className="profile-card-container">
        <SpotlightCard as="section" className="student-profile-card" aria-label="Student profile">
          <div className="profile-identity">
            <span className="profile-avatar" aria-hidden="true">{student.name.charAt(0)}</span>
            <div>
              <h2>{student.name}</h2>
              <p>{student.role}</p>
            </div>
          </div>
          <div className="profile-performance">
            <div className="profile-score" aria-label={`Overall performance ${student.performance} percent`}>
              <svg className="profile-score-ring" viewBox="0 0 110 110" aria-hidden="true">
                <circle cx="55" cy="55" r="50" />
              </svg>
              <span><CountUp value={student.performance} /></span>
            </div>
            <div className="profile-rank">
              <span className="card-label">Overall performance</span>
              <strong><CountUp value={student.cohortRank} /> in your cohort</strong>
            </div>
          </div>
          <p className="profile-milestone">
            Next milestone: <strong>{student.milestone}</strong>
            <span>Deadline: <CountUp value={student.deadline} /></span>
          </p>
        </SpotlightCard>
      </Reveal>

      <div className="dashboard-content">
        <Reveal as="section" index={0} className="at-a-glance dashboard-section" aria-labelledby="glance-title">
          <div className="section-heading centered-heading">
            <p className="section-eyebrow">At a glance</p>
            <h2 id="glance-title">Where you stand, <em>{student.name}</em></h2>
          </div>
          <div className="glance-status">
            <div className="status-copy">
              <p className="section-eyebrow">Application status</p>
              <h3>
                {overview.applicationStatus.startsWith("In ")
                  ? <>In <ShinyText>{overview.applicationStatus.slice(3)}</ShinyText></>
                  : overview.applicationStatus}
              </h3>
              <p>{overview.statusDescription}</p>
            </div>
            <div className="glance-metrics">
              <SpotlightCard as="article" className="glance-metric">
                <p className="section-eyebrow">Examination score</p>
                <strong><CountUp value={`${overview.examinationScore}/100`} /></strong>
                <span><CountUp value="Top 20%" /> of candidates</span>
              </SpotlightCard>
              <article className="glance-metric tasks-glance">
                <p className="section-eyebrow">Tasks completed</p>
                <strong><CountUp value={`${overview.tasksCompleted} of ${overview.totalTasks}`} /></strong>
                <span><CountUp value={overview.totalTasks - overview.tasksCompleted} /> remaining this month</span>
              </article>
            </div>
          </div>
          <div className="momentum">
            <div className="momentum-ring"><CountUp value={student.performance} /><small>%</small></div>
            <div>
              <p className="section-eyebrow">Overall performance</p>
              <h3>{overview.performanceSummary}</h3>
              <p><CountUp value={`${student.cohortRank} • ${overview.performanceChange} • Previous: ${overview.previousPerformance}`} /></p>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" index={1} className="journey-panel dashboard-section" aria-labelledby="journey-title">
          <div className="section-heading centered-heading">
            <p className="section-eyebrow">Recruitment journey</p>
            <h2 id="journey-title">Five steps to <em>belonging</em></h2>
          </div>
          <ol className="journey-steps">
            {dashboardData.journey.map((step) => (
              <li className={`journey-step ${step.state}`} key={step.number}>
                <span className="journey-number"><CountUp value={step.number} /></span>
                <h3>{step.name}</h3>
                <p><CountUp value={step.detail} /></p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal as="section" index={2} className="performance-section dashboard-section" aria-labelledby="performance-title">
          <div className="section-heading">
            <p className="section-eyebrow">Performance overview</p>
            <h2 className="visually-hidden" id="performance-title">Your performance overview</h2>
          </div>
          <div className="performance-grid">
            <div className="performance-highlight">
              <strong><CountUp value={student.performance} /><small>%</small></strong>
              <h3>{overview.bestQuarter}</h3>
              <p>{overview.performanceDescription}</p>
            </div>
            <div className="trend-chart">
              <p className="section-eyebrow">Monthly trend</p>
              <svg
                viewBox="0 0 420 125"
                role="img"
                aria-label={`Performance rising from ${dashboardData.monthlyTrend[0].value} in ${dashboardData.monthlyTrend[0].month} to ${dashboardData.monthlyTrend.at(-1).value} in ${dashboardData.monthlyTrend.at(-1).month}`}
              >
                <defs>
                  <linearGradient id="performance-area-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6d9fb1" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#6d9fb1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="30" y1="102" x2="398" y2="102" />
                <line x1="30" y1="62" x2="398" y2="62" />
                <line x1="30" y1="22" x2="398" y2="22" />
                <path className="performance-area" d={chartArea} />
                <path className="performance-trend-line" pathLength="1" d={`M${chartPoints.replaceAll(" ", " L")}`} />
                {chartCoordinates.map((point) => (
                  <circle
                    className="performance-dot"
                    key={point.month}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    tabIndex="0"
                    aria-label={`${point.month}: ${point.value}`}
                  >
                    <title>{`${point.month}: ${point.value}`}</title>
                  </circle>
                ))}
              </svg>
              <div className="chart-months">
                {dashboardData.monthlyTrend.map((point) => <span key={point.month}>{point.month}</span>)}
              </div>
            </div>
            <div className="performance-stat">
              <p className="section-eyebrow">Current score</p>
              <strong><CountUp value={`${overview.examinationScore} / 100`} /></strong>
            </div>
            <div className="performance-stat">
              <p className="section-eyebrow">Project completion</p>
              <strong><CountUp value={`${overview.projectCompletion} / 100`} /></strong>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" index={3} className="tasks-section dashboard-section" id="upcoming-tasks" aria-labelledby="tasks-title">
          <div className="section-heading">
            <p className="section-eyebrow">Upcoming tasks</p>
            <h2 id="tasks-title">What needs your <em>attention</em></h2>
          </div>
          <ul className="task-list">
            {dashboardData.tasks.map((task) => (
              <li className="task-item" data-priority={task.priority.toLowerCase()} key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
                <div className="task-meta">
                  <time><CountUp value={task.date} /></time>
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" index={4} className="activity-section dashboard-section" aria-labelledby="activity-title">
          <div className="section-heading">
            <p className="section-eyebrow">Recent activity</p>
            <h2 id="activity-title">Lately</h2>
          </div>
          <ol className="activity-list">
            {dashboardData.activity.map((activity) => (
              <li className="activity-item" key={activity.title}>
                <span className="activity-dot" aria-hidden="true" />
                <div>
                  <h3>{activity.title}</h3>
                  <p><CountUp value={activity.detail} /></p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal as="section" index={5} className="skills-section dashboard-section" aria-labelledby="skills-title">
          <div className="section-heading">
            <p className="section-eyebrow">Skills &amp; development</p>
            <h2 id="skills-title">What you bring to the society</h2>
            <p className="section-description">Excel in areas your membership profile shows and grow stronger.</p>
          </div>
          <ul className="skills-list">
            {dashboardData.skills.map((skill, index) => (
              <li className="skill-item" key={skill.name}>
                <span>{skill.name}</span>
                <strong><CountUp value={`${skill.score}${skill.type === "points" ? " / 100" : "%"}`} /></strong>
                <span className="skill-bar" aria-hidden="true">
                  <span style={{ "--skill-score": `${skill.score}%`, "--skill-index": index }} />
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" index={6} className="recommendations-section dashboard-section" aria-labelledby="recommendations-title">
          <div className="section-heading">
            <p className="section-eyebrow">Recommended actions</p>
            <h2 className="visually-hidden" id="recommendations-title">Recommended actions for you</h2>
          </div>
          <div className="recommendations-content">
            <ol className="recommendation-list">
              {dashboardData.recommendations.map((recommendation, index) => (
                <SpotlightCard as="li" key={recommendation.taskId}>
                  <span><CountUp value={index + 1} /></span>
                  <p>{recommendation.text}</p>
                </SpotlightCard>
              ))}
            </ol>
            <div className="recommendation-metrics">
              <div><strong><CountUp value={overview.productivityScore} /></strong><span>Productivity score</span></div>
              <div><strong><CountUp value={`${overview.tasksCompleted}/${overview.totalTasks}`} /></strong><span>Tasks done</span></div>
            </div>
          </div>
        </Reveal>

        <Reveal as="div" index={7}>
          <SpotlightCard as="aside" className="ai-insight" aria-labelledby="insight-title">
            <p className="insight-eyebrow"><span aria-hidden="true">✦</span> AI insight</p>
            <h2 id="insight-title">{dashboardData.insight.heading}</h2>
            <blockquote>“{dashboardData.insight.quote}”</blockquote>
            <Magnet className="insight-link" href="/student/ai-recommendations">
              View detailed insights <span aria-hidden="true">→</span>
            </Magnet>
          </SpotlightCard>
        </Reveal>
      </div>

      <footer className="dashboard-footer">
        <span>SocietySelect AI</span>
        <span aria-hidden="true">•</span>
        <span>Empowering the next generation</span>
      </footer>
    </main>
  );
};

export default StudentDashboard;
