import { useEffect, useState } from "react";
import {Users,ClipboardCheck,FolderKanban,CalendarDays,ArrowUpRight,Clock,CheckCircle2,CircleAlert,BookOpen,ChevronRight,ChevronsRight,} from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import { navigateTo } from "../utils/navigation";
import "./MentorDashboard.css";
function TextMorphHeading() {
  const words = ["Guide.", "Inspire.", "Empower."];

  return (
    <h2 className="mentor-morph-heading">
      {words.map((word, index) => (
        <span
          key={word}
          style={{animationDelay: `${index * 2}s`,}}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}

function MentorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/mentor/dashboard")
      .then((data) => {
        if (active) setDashboardData(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!dashboardData && !error) return <LoadingPage />;

  if (error) {
    return (
      <div className="mentor-dashboard">
        <MentorSidebar />
        <main className="mentor-main">
          <h1>Unable to load mentor dashboard</h1>
          <p role="alert">{error}</p>
          <a href="/login">Sign in</a>
        </main>
      </div>
    );
  }

  const mentorName = dashboardData.mentor.fullName;
  const students = dashboardData.studentProgress.map((student) => ({
    id: student.id,
    name: student.fullName,
    initials: student.fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
    society: student.domain,
    progress: student.progressPercentage,
    status: student.progressPercentage >= 60 ? "On Track" : "Needs Attention",
  }));
  const schedule = dashboardData.schedule.map((item) => ({
    id: item.applicationId,
    time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "Time not set",
    title: "Interview",
    student: item.studentName,
    category: `${item.domain} · ${item.mode || "Mode not set"}`,
  }));
  const reviews = dashboardData.pendingReviews.map((review) => ({
    id: `${review.taskId}-${review.studentId}`,
    title: review.taskTitle,
    student: review.studentName,
    time: review.submittedAt ? new Date(review.submittedAt).toLocaleString() : "Recently submitted",
  }));
  const stats = [
    { title: "Assigned Students", value: dashboardData.stats.assignedStudentsCount, icon: Users, link: "/mentor/students" },
    { title: "Pending Reviews", value: dashboardData.stats.pendingReviewsCount, icon: ClipboardCheck, link: "/mentor/projects" },
    { title: "Active Tasks", value: dashboardData.stats.activeTasksCount, icon: FolderKanban, link: "/mentor/projects" },
  ];
  const quickActions = [
    { title: "My Students", description: "View and manage assigned students", icon: Users, link: "/mentor/students" },
    { title: "Review Submissions", description: "Evaluate pending student work", icon: ClipboardCheck, link: "/mentor/projects" },
    { title: "Track Tasks", description: "Monitor assigned domain tasks", icon: FolderKanban, link: "/mentor/projects" },
    { title: "Interviews", description: "Schedule and evaluate candidates", icon: CalendarDays, link: "/mentor/interviews" },
  ];

  const handleNav = (e, url) => {
    e.preventDefault();
    navigateTo(url);
  };

  return (
    <div className="mentor-dashboard">
      <MentorSidebar />
      <main className="mentor-main">
        <header className="mentor-header">
          <div className="mentor-header-text">
            <h1>Mentor Dashboard</h1>
          </div>
          <div className="mentor-header-right">
            <div className="mentor-header-user">
              <div className="mentor-header-avatar">AM</div>
              <div>
                <h3>{mentorName}</h3>
              </div>
            </div>
          </div>
        </header>

        <section className="mentor-welcome-banner">
          <div className="mentor-banner-arrows top-left">
            <ChevronsRight size={50} />
            <ChevronsRight size={50} />
            <ChevronsRight size={50} />
          </div>

          <div className="mentor-welcome-text">
            <span className="mentor-eyebrow">YOUR IMPACT MATTERS</span>
            <TextMorphHeading />
            <p>
              Every student has potential. Your guidance helps transform
              that potential into meaningful achievements.
            </p>
            <a
              href="/mentor/students"
              className="mentor-primary-btn"
              onClick={(e) => handleNav(e, "/mentor/students")}
            >
              Explore Students
            </a>
          </div>

          <div className="mentor-banner-arrows bottom-right">
            <ChevronsRight size={50} />
            <ChevronsRight size={50} />
            <ChevronsRight size={50} />
          </div>
        </section>

        <section className="mentor-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className={`mentor-stat-card ${
                  stat.link ? "mentor-stat-card-clickable" : ""
                }`}
                key={stat.title}
                onClick={() => stat.link && navigateTo(stat.link)}
                title={stat.link ? `Go to ${stat.title}` : undefined}
              >
                <div className="mentor-stat-top">
                  <div className="mentor-stat-icon">
                    <Icon size={24} />
                  </div>
                </div>

                <div className="mentor-stat-content">
                  <div className="mentor-stat-header">
                    <h3>{stat.title}</h3>
                    <div className="mentor-stat-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>

                  <h2>{stat.value}</h2>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mentor-middle-grid">
          <div className="mentor-panel">
            <div className="mentor-panel-heading">
              <div>
                <span className="mentor-section-label">
                  STUDENT OVERVIEW
                </span>
                <h2>Student Progress</h2>
              </div>
              <a
                href="/mentor/students"
                className="mentor-view-all"
                onClick={(e) => handleNav(e, "/mentor/students")}
              >
                View all <ChevronRight size={16} />
              </a>
            </div>
            <div className="mentor-student-list">
              {students.map((student) => (
                <div
                  className="mentor-student-row clickable"
                  key={student.name}
                  onClick={() => navigateTo(`/mentor/students/${student.id}`)}
                  title={`View details for ${student.name}`}
                >
                  <div className="mentor-student-avatar">
                    {student.initials}
                  </div>

                  <div className="mentor-student-details">
                    <h3>{student.name}</h3>
                    <p>{student.society}</p>

                    <div className="mentor-progress-track">
                      <div
                        className="mentor-progress-fill"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mentor-student-result">
                    <strong>{student.progress}%</strong>
                    <span
                      className={
                        student.status === "On Track"
                          ? "mentor-status on-track"
                          : "mentor-status needs-attention"
                      }
                    >
                      {student.status === "On Track" ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <CircleAlert size={13} />
                      )}
                      {student.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mentor-panel mentor-schedule-panel">
            <div className="mentor-panel-heading">
              <div>
                <span className="mentor-section-label">
                  YOUR CALENDAR
                </span>
                <h2>Today's Schedule</h2>
              </div>

              <CalendarDays
                size={22}
                className="mentor-heading-icon"
              />
            </div>

            <div className="mentor-schedule-list">
              {schedule.map((item) => (
                <div className="mentor-schedule-item" key={item.id}>
                  <div className="mentor-schedule-time">
                    <Clock size={14} />
                    <span>{item.time}</span>
                  </div>

                  <div className="mentor-schedule-details">
                    <h3>{item.title}</h3>
                    <p>{item.student}</p>
                    <span>{item.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/mentor/interviews"
              className="mentor-schedule-link"
              onClick={(e) => handleNav(e, "/mentor/interviews")}
            >
              View full schedule <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="mentor-bottom-grid">
          <div className="mentor-panel mentor-reviews-panel">
            <div className="mentor-panel-heading">
              <div>
                <span className="mentor-section-label">
                  ACTION REQUIRED
                </span>
                <h2>Pending Reviews</h2>
              </div>

              <span className="mentor-review-badge">{reviews.length} NEW</span>
            </div>
            <div className="mentor-review-list">
              {reviews.map((review) => (
                <div className="mentor-review-item" key={review.title}>
                  <div className="mentor-review-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="mentor-review-details">
                    <h3>{review.title}</h3>
                    <p>{review.student}</p>
                    <span>{review.time}</span>
                  </div>
                  <a
                    href="/mentor/tasks"
                    className="mentor-review-action"
                    aria-label={`Review ${review.title}`}
                    onClick={(e) => handleNav(e, "/mentor/tasks")}
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              ))}
            </div>
            <a
              href="/mentor/tasks"
              className="mentor-all-reviews"
              onClick={(e) => handleNav(e, "/mentor/tasks")}
            >
              View all submissions <ChevronRight size={16} />
            </a>
          </div>

          <div className="mentor-panel mentor-quick-panel">
            <div className="mentor-panel-heading">
              <div>
                <span className="mentor-section-label">
                  GET THINGS DONE
                </span>
                <h2>Quick Actions</h2>
              </div>
            </div>
            <div className="mentor-quick-list">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    href={action.link}
                    className="mentor-quick-action"
                    key={action.title}
                    onClick={(e) => handleNav(e, action.link)}
                  >
                    <div className="mentor-quick-icon">
                      <Icon size={20} />
                    </div>

                    <div className="mentor-quick-details">
                      <h3>{action.title}</h3>
                      <p>{action.description}</p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="mentor-quick-arrow"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <footer className="mentor-footer">
          <p>© 2026 SocietySelect. All rights reserved.</p>
          <p>Empowering student growth, one step at a time.</p>
        </footer>
      </main>
    </div>
  );
}

export default MentorDashboard;
