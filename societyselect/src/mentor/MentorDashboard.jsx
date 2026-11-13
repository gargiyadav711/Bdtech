import { Users, ClipboardCheck, FolderKanban, CalendarDays, ArrowUpRight, Clock, CheckCircle2, CircleAlert, BookOpen, ChevronRight, } from "lucide-react";

import MentorSidebar from "../Components/MentorSidebar";
import "./MentorDashboard.css";
function TextMorphHeading() {
  const words = ["Guide.", "Inspire.", "Empower."];

  return (
    <h2 className="mentor-morph-heading">
      {words.map((word, index) => (
        <span
          key={word}
          style={{
            animationDelay: `${index * 2}s`,
          }}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}
const stats = [
  {
    title: "Assigned Students",
    value: "03",
    icon: Users,
  },
  {
    title: "Pending Reviews",
    value: "02",
    icon: ClipboardCheck,
  },
  {
    title: "Active Projects",
    value: "01",
    icon: FolderKanban,
  },
];

const students = [
  {
    name: "Gargi Yadav",
    initials: "GY",
    society: "A Society",
    progress: 85,
    status: "On Track",
  },
  {
    name: "priya Tiwari",
    initials: "PV",
    society: "A Society",
    progress: 65,
    status: "On Track",
  },
  {
    name: "Aastha",
    initials: "AS",
    society: "A Society",
    progress: 42,
    status: "Needs Attention",
  },
];

const schedule = [
  {
    time: "10:00 AM",
    title: "Project Review",
    student: "Gargi Yadav",
    category: "Project Discussion",
  },
  {
    time: "12:30 PM",
    title: "Mentoring Session",
    student: "Priya Tiwari",
    category: "Career Guidance",
  },
  {
    time: "03:00 PM",
    title: "Progress Check-in",
    student: "Aastha",
    category: "Weekly Review",
  },
];

const reviews = [
  {
    title: "Portfolio Website",
    student: "Gargi Yadav",
    time: "2 hours ago",
  },
  {
    title: "Database Management Project",
    student: "Priya Tiwari",
    time: "Yesterday",
  },
  {
    title: "Mini Project Documentation",
    student: "Aastha",
    time: "Yesterday",
  },
];

const quickActions = [
  {
    title: "Manage Students",
    description: "View and manage assigned students",
    icon: Users,
    link: "/mentor/students",
  },
  {
    title: "Review Submissions",
    description: "Evaluate pending student work",
    icon: ClipboardCheck,
    link: "/mentor/tasks",
  },
  {
    title: "Track Projects",
    description: "Monitor ongoing projects",
    icon: FolderKanban,
    link: "/mentor/projects",
  },
  {
    title: "View Attendance",
    description: "Check student attendance records",
    icon: CalendarDays,
    link: "/mentor/attendance",
  },
];

function MentorDashboard() {
  const mentorName = "Aastha Sharma";
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
          <div className="mentor-welcome-text">
            <span className="mentor-eyebrow">YOUR IMPACT MATTERS</span>
            <TextMorphHeading />
            <p>
              Every student has potential. Your guidance helps transform
              that potential into meaningful achievements.
            </p>
            <a href="/mentor/students" className="mentor-primary-btn">
              Explore Students
            </a>
          </div>
        </section>
        <section className="mentor-stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article className="mentor-stat-card" key={stat.title}>
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
              <a href="/mentor/students" className="mentor-view-all">
                View all <ChevronRight size={16} />
              </a>
            </div>
            <div className="mentor-student-list">
              {students.map((student) => (
                <div className="mentor-student-row" key={student.name}>
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
                <div className="mentor-schedule-item" key={item.time}>
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

            <a href="/mentor/attendance" className="mentor-schedule-link">
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

              <span className="mentor-review-badge">03 NEW</span>
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
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              ))}
            </div>
            <a href="/mentor/tasks" className="mentor-all-reviews">
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
