import { useCallback, useEffect, useRef, useState } from "react";
import {
  BlurText,
  CountUp,
  Magnet,
  Reveal,
  ShinyText,
  SpotlightCard,
} from "../../Components/ui/DashboardEffects.jsx";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [overviewData, setOverviewData] = useState(null);
  const [overviewLoadedAt, setOverviewLoadedAt] = useState(null);
  const [overviewError, setOverviewError] = useState("");
  const navbarLinksRef = useRef(null);
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
    let active = true;
    apiRequest("/api/student/overview")
      .then((data) => {
        if (active) {
          setOverviewData(data);
          setOverviewLoadedAt(Date.now());
        }
      })
      .catch((error) => {
        if (active) setOverviewError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const activeLink = navbarLinksRef.current?.querySelector(`[data-nav="${activeNav}"]`);
    if (activeLink) moveNavIndicator(activeLink);
    const handleResize = () => {
      const currentLink = navbarLinksRef.current?.querySelector(`[data-nav="${activeNav}"]`);
      if (currentLink) moveNavIndicator(currentLink);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeNav, isMenuOpen, moveNavIndicator, overviewData]);

  if (overviewError) {
    return (
      <main className="student-dashboard">
        <section className="dashboard-section" role="alert">
          <h1>Unable to load your dashboard</h1>
          <p>{overviewError}</p>
          <a href="/login">Sign in</a>
        </section>
      </main>
    );
  }

  if (!overviewData) {
    return <LoadingPage />;
  }

  const apiStudent = overviewData.student;
  const kpis = overviewData.kpis;
  const applicationStage = kpis.applicationStage || "NOT_APPLIED";
  const stageLabel = applicationStage.replaceAll("_", " ");
  const taskScore = kpis.averageTaskScore;
  const score = taskScore ?? kpis.interviewScore ?? 0;
  const completionRate = kpis.totalTasks
    ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
    : 0;
  const submittedActivity = (overviewData.recentSubmissions || []).map((submission) => ({
    title: submission.taskTitle,
    detail: `${submission.status.replaceAll("_", " ")} · ${new Date(submission.submittedAt).toLocaleDateString()}`,
  }));
  const upcomingTasks = (overviewData.upcomingTasks || []).map((task) => {
    const daysRemaining = Math.ceil((new Date(task.deadline) - overviewLoadedAt) / 86400000);
    return {
      id: String(task.taskId),
      title: task.title,
      description: task.description,
      date: new Date(task.deadline).toLocaleDateString(),
      priority: daysRemaining <= 3 ? "High" : daysRemaining <= 7 ? "Medium" : "Low",
    };
  });
  const gradedTasks = (overviewData.recentSubmissions || [])
    .filter((submission) => submission.marksObtained !== null && submission.marksObtained !== undefined)
    .slice(0, 6)
    .reverse()
    .map((submission, index) => ({
      month: `Task ${index + 1}`,
      value: Math.round((submission.marksObtained / Math.max(submission.maxMarks || 100, 1)) * 100),
    }));
  const dashboardData = {
    student: {
      name: apiStudent.fullName,
      role: (kpis.probationStatus || "APPLICANT").replaceAll("_", " "),
      performance: score,
      cohortRank: apiStudent.domain || "Domain not set",
      milestone: stageLabel,
      deadline: upcomingTasks[0]?.date || "No pending tasks",
    },
    overview: {
      applicationStatus: stageLabel,
      statusDescription: overviewData.application
        ? `Your application for ${overviewData.application.societyName} is at the ${stageLabel.toLowerCase()} stage.`
        : "Submit your society application to begin tracking your recruitment journey.",
      examinationScore: kpis.interviewScore,
      tasksCompleted: kpis.completedTasks,
      totalTasks: kpis.totalTasks,
      performanceSummary: taskScore === null ? "No graded tasks yet" : `${taskScore}% average task score`,
      projectCompletion: completionRate,
      productivityScore: kpis.completedTasks,
      performanceAvailable: taskScore !== null || kpis.interviewScore !== null,
    },
    journey: [
      { number: "1", name: "Application", detail: stageLabel, state: applicationStage === "NOT_APPLIED" ? "current" : "complete" },
      { number: "2", name: "Assessment", detail: "Assessment stage", state: applicationStage === "ASSESSMENT" ? "current" : "upcoming" },
      { number: "3", name: "Interview", detail: overviewData.application?.interview?.scheduledAt ? new Date(overviewData.application.interview.scheduledAt).toLocaleString() : "Not scheduled", state: overviewData.application?.interview?.scheduledAt ? "complete" : "upcoming" },
      { number: "4", name: "Probation", detail: (kpis.probationStatus || "APPLICANT").replaceAll("_", " "), state: kpis.probationStatus === "ON_PROBATION" ? "current" : "upcoming" },
      { number: "5", name: "Final Selection", detail: "Awaiting final decision", state: kpis.probationStatus === "SELECTED" ? "complete" : "upcoming" },
    ],
    monthlyTrend: gradedTasks,
    tasks: upcomingTasks,
    activity: submittedActivity,
    skills: (apiStudent.skills || []).map((name) => ({ name })),
    recommendations: upcomingTasks.slice(0, 3).map((task) => ({
      taskId: task.id,
      text: `Complete ${task.title} by ${task.date}.`,
    })),
    insight: {
      heading: "Your next step towards growth",
      quote: upcomingTasks[0]
        ? `Focus on completing "${upcomingTasks[0].title}" before its deadline.`
        : "Check your task list regularly for new work from your mentor.",
    },
  };
  const { student, overview } = dashboardData;
  const chartCoordinates = dashboardData.monthlyTrend.map((point, index) => ({
    ...point,
    x: 30 + (index / Math.max(dashboardData.monthlyTrend.length - 1, 1)) * 368,
    y: 102 - (point.value / 100) * 80,
  }));
  const chartPoints = chartCoordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const chartArea = chartCoordinates.length
    ? `M${chartCoordinates[0].x},102 L${chartPoints} L${chartCoordinates.at(-1).x},102 Z`
    : "";

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
            href="/student/tasks"
            className={`nav-link${activeNav === "Tasks" ? " active" : ""}`}
            data-nav="Tasks"
            onMouseEnter={(event) => moveNavIndicator(event.currentTarget)}
            onClick={() => handleNavClick("Tasks")}
          >
            Tasks
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
          <Magnet className="hero-button" href="/student/tasks">View My Tasks</Magnet>
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
            <div className="profile-score" aria-label={`Current score ${student.performance} percent`}>
              <svg className="profile-score-ring" viewBox="0 0 110 110" aria-hidden="true">
                <circle cx="55" cy="55" r="50" />
              </svg>
              <span><CountUp value={student.performance} /></span>
            </div>
            <div className="profile-rank">
              <span className="card-label">Domain</span>
              <strong><CountUp value={student.cohortRank} /></strong>
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
              <a className="insight-link" href={overview.applicationStatus === "NOT APPLIED" ? "/student/apply" : "/student/application-tracking"}>
                {overview.applicationStatus === "NOT APPLIED" ? "Start application →" : "Track application →"}
              </a>
            </div>
            <div className="glance-metrics">
              <SpotlightCard as="article" className="glance-metric">
                <p className="section-eyebrow">Interview score</p>
                <strong>{overview.examinationScore === null ? "—" : <CountUp value={`${overview.examinationScore}/100`} />}</strong>
                <span>{overview.examinationScore === null ? "Not published" : "Published result"}</span>
              </SpotlightCard>
              <article className="glance-metric tasks-glance">
                <p className="section-eyebrow">Tasks completed</p>
                <strong><CountUp value={`${overview.tasksCompleted} of ${overview.totalTasks}`} /></strong>
                <span><CountUp value={overview.totalTasks - overview.tasksCompleted} /> remaining</span>
              </article>
            </div>
          </div>
          <div className="momentum">
            <div className="momentum-ring">
              {overview.performanceAvailable ? <CountUp value={student.performance} /> : "—"}
              <small>{overview.performanceAvailable ? "%" : ""}</small>
            </div>
            <div>
              <p className="section-eyebrow">Task performance</p>
              <h3>{overview.performanceSummary}</h3>
              <p>{student.cohortRank} · {overview.tasksCompleted} of {overview.totalTasks} tasks submitted</p>
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
              <strong>{overview.performanceAvailable ? <><CountUp value={student.performance} /><small>%</small></> : "—"}</strong>
              <h3>Current score</h3>
              <p>Calculated from your available graded tasks or published interview score.</p>
            </div>
            <div className="trend-chart">
              <p className="section-eyebrow">Recent graded tasks</p>
              {dashboardData.monthlyTrend.length ? (
                <>
                  <svg viewBox="0 0 420 125" role="img" aria-label="Recent task scores">
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
                        aria-label={`${point.month}: ${point.value}%`}
                      >
                        <title>{`${point.month}: ${point.value}%`}</title>
                      </circle>
                    ))}
                  </svg>
                  <div className="chart-months">
                    {dashboardData.monthlyTrend.map((point) => <span key={point.month}>{point.month}</span>)}
                  </div>
                </>
              ) : <p>No graded tasks yet.</p>}
            </div>
            <div className="performance-stat">
              <p className="section-eyebrow">Interview score</p>
              <strong>{overview.examinationScore === null ? "—" : <CountUp value={`${overview.examinationScore} / 100`} />}</strong>
            </div>
            <div className="performance-stat">
              <p className="section-eyebrow">Task completion</p>
              <strong><CountUp value={`${overview.projectCompletion} / 100`} /></strong>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" index={3} className="tasks-section dashboard-section" id="upcoming-tasks" aria-labelledby="tasks-title">
          <div className="section-heading">
            <p className="section-eyebrow">Pending tasks</p>
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
          {!dashboardData.tasks.length ? <p>No pending tasks right now.</p> : null}
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
          {!dashboardData.activity.length ? <p>No submissions yet.</p> : null}
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
                <strong>In profile</strong>
                <span className="skill-bar" aria-hidden="true">
                  <span style={{ "--skill-score": "100%", "--skill-index": index }} />
                </span>
              </li>
            ))}
          </ul>
          {!dashboardData.skills.length ? <p>Add skills to your profile to see them here.</p> : null}
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
