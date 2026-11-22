
import { useMemo, useState } from "react";
import "./ProbationPerformance.css";
import MentorSidebar from "./MentorSidebar";
import ProbationBanner from "./ui/ProbationBanner.jsx";

const initialStudents = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav@gmail.com",
    role: "Frontend Developer",
    avatar: "AS",
    progress: 85,
    completedTasks: 17,
    totalTasks: 20,
    attendance: 94,
    projectScore: 9.2,
    status: "On Track",
    pendingTasks: 3,
    feedback: "Good progress. Keep improving your React skills.",
  },
  {
    id: 2,
    name: "Priya Verma",
    email: "priya@gmail.com",
    role: "Backend Developer",
    avatar: "PV",
    progress: 62,
    completedTasks: 12,
    totalTasks: 20,
    attendance: 88,
    projectScore: 7.8,
    status: "Needs Attention",
    pendingTasks: 8,
    feedback: "Work on API integration and database concepts.",
  },
  {
    id: 3,
    name: "Rahul Singh",
    email: "rahul@gmail.com",
    role: "AI/ML Developer",
    avatar: "RS",
    progress: 45,
    completedTasks: 9,
    totalTasks: 20,
    attendance: 76,
    projectScore: 6.5,
    status: "At Risk",
    pendingTasks: 11,
    feedback: "Needs improvement in task completion and consistency.",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    email: "sneha@gmail.com",
    role: "UI/UX Designer",
    avatar: "SG",
    progress: 92,
    completedTasks: 19,
    totalTasks: 20,
    attendance: 98,
    projectScore: 9.5,
    status: "On Track",
    pendingTasks: 1,
    feedback: "Excellent design work and consistent performance.",
  },
  {
    id: 5,
    name: "Karan Mehta",
    email: "karan@gmail.com",
    role: "Full Stack Developer",
    avatar: "KM",
    progress: 70,
    completedTasks: 14,
    totalTasks: 20,
    attendance: 91,
    projectScore: 8.2,
    status: "On Track",
    pendingTasks: 6,
    feedback: "Good overall performance. Focus on project quality.",
  },
];

function ProgressBar({ value, color }) {
  return (
    <div className="pp-progress-track">
      <div
        className="pp-progress-fill"
        style={{
          width: `${value}%`,
          background: color || "#477f91",
        }}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const className =
    status === "On Track"
      ? "on-track"
      : status === "At Risk"
      ? "at-risk"
      : "needs-attention";

  return (
    <span className={`pp-status ${className}`}>
      {status}
    </span>
  );
}

function StatCard({ icon, label, value, description, color }) {
  return (
    <div className="pp-stat-card">
      <div
        className="pp-stat-icon"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>

      <div className="pp-stat-content">
        <p>{label}</p>
        <h2>{value}</h2>
        <span>{description}</span>
      </div>
    </div>
  );
}

export default function ProbationPerformance() {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [notification, setNotification] = useState("");

  const totalStudents = students.length;

  const averageProgress = totalStudents
    ? Math.round(
        students.reduce((sum, s) => sum + s.progress, 0) /
          totalStudents
      )
    : 0;

  const completedTasks = students.reduce(
    (sum, s) => sum + s.completedTasks,
    0
  );

  const totalTasks = students.reduce(
    (sum, s) => sum + s.totalTasks,
    0
  );

  const needsAttention = students.filter(
    (s) => s.status !== "On Track"
  ).length;

  const averageAttendance = totalStudents
    ? Math.round(
        students.reduce((sum, s) => sum + s.attendance, 0) /
          totalStudents
      )
    : 0;

  const averageScore = totalStudents
    ? (
        students.reduce((sum, s) => sum + s.projectScore, 0) /
        totalStudents
      ).toFixed(1)
    : "0.0";

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.role.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "All" ||
        student.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, filterStatus]);

  const showMessage = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const openFeedback = (student) => {
    setSelectedStudent(student);
    setFeedback(student.feedback || "");
    setShowFeedback(true);
  };

  const saveFeedback = () => {
    if (!selectedStudent) return;

    setStudents((previous) =>
      previous.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, feedback }
          : student
      )
    );

    setShowFeedback(false);
    setSelectedStudent(null);
    showMessage("Mentor feedback saved successfully!");
  };

  const getRecommendations = () => {
    const recommendations = [];

    students.forEach((student) => {
      if (student.attendance < 80) {
        recommendations.push({
          id: student.id + "-attendance",
          student: student.name,
          type: "warning",
          title: "Attendance needs attention",
          message:
            "Review attendance records and discuss any difficulties with the student.",
        });
      }

      if (student.progress < 60) {
        recommendations.push({
          id: student.id + "-progress",
          student: student.name,
          type: "danger",
          title: "Low task completion",
          message:
            "Review pending tasks and consider creating smaller milestones.",
        });
      }

      if (student.progress >= 85 && student.attendance >= 90) {
        recommendations.push({
          id: student.id + "-excellent",
          student: student.name,
          type: "success",
          title: "Strong performance",
          message:
            "This student is progressing well. Consider assigning an advanced task.",
        });
      }
    });

    return recommendations;
  };

  const recommendations = getRecommendations();

  const analyticsData = [
    {
      label: "Task Completion",
      value: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      color: "#477f91",
    },
    {
      label: "Average Attendance",
      value: averageAttendance,
      color: "#16a085",
    },
    {
      label: "Average Progress",
      value: averageProgress,
      color: "#e6a23c",
    },
    {
      label: "Project Performance",
      value: Math.round((Number(averageScore) / 10) * 100),
      color: "#e56b8a",
    },
  ];

  return (
    <div className="pp-app-shell">
      <MentorSidebar />
      <main className="pp-page">
        {/* Notification */}
        {notification && (
          <div className="pp-toast">
            ✓ {notification}
          </div>
        )}

        {/* Page Header */}
        <div className="pp-header">
          <div>
            <h1>Probation & Performance</h1>
          </div>

          <div className="pp-header-right">
            <span className="pp-session-badge">
              ● Recruitment 2026
            </span>
          </div>
        </div>
        <ProbationBanner />

        {/* Navigation Tabs */}
        <div className="pp-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          ▦ Overview
        </button>

        <button
          className={activeTab === "tracking" ? "active" : ""}
          onClick={() => setActiveTab("tracking")}
        >
          ◉ Probation Tracking
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          ▥ Analytics
        </button>
        </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="pp-content">
          <div className="pp-section-heading">
            <div>
              <h2>Performance Overview</h2>
              <p>Here's how your probation students are performing.</p>
            </div>

            <button
              className="pp-primary-btn"
              onClick={() => setActiveTab("tracking")}
            >
              View Students →
            </button>
          </div>

          {/* Statistics */}
          <div className="pp-stats-grid">
            <StatCard
              icon="♙"
              label="Total Students"
              value={totalStudents}
              description="Currently in probation"
              color="#477f91"
            />

            <StatCard
              icon="◴"
              label="Average Progress"
              value={`${averageProgress}%`}
              description="Overall completion"
              color="#16a085"
            />

            <StatCard
              icon="✓"
              label="Tasks Completed"
              value={completedTasks}
              description={`Out of ${totalTasks} assigned`}
              color="#e6a23c"
            />

            <StatCard
              icon="!"
              label="Need Attention"
              value={needsAttention}
              description="Students to review"
              color="#e56b8a"
            />
          </div>

          {/* Overview Content */}
          <div className="pp-overview-grid">
            <div className="pp-panel">
              <div className="pp-panel-heading">
                <div>
                  <h3>Student Progress</h3>
                  <p>Individual probation progress</p>
                </div>

                <button
                  className="pp-text-btn"
                  onClick={() => setActiveTab("tracking")}
                >
                  View all →
                </button>
              </div>

              <div className="pp-student-list">
                {students.slice(0, 4).map((student) => (
                  <div className="pp-overview-student" key={student.id}>
                    <div className="pp-avatar">
                      {student.avatar}
                    </div>

                    <div className="pp-overview-student-info">
                      <div className="pp-student-name-row">
                        <strong>{student.name}</strong>
                        <span>{student.progress}%</span>
                      </div>

                      <ProgressBar value={student.progress} />

                      <small>{student.role}</small>
                    </div>

                    <StatusBadge status={student.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-panel">
              <div className="pp-panel-heading">
                <div>
                  <h3>Performance Summary</h3>
                  <p>Key performance indicators</p>
                </div>
              </div>

              {analyticsData.map((item) => (
                <div className="pp-summary-item" key={item.label}>
                  <div className="pp-summary-label">
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>

                  <ProgressBar
                    value={item.value}
                    color={item.color}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="pp-panel pp-recommendation-panel">
            <div className="pp-panel-heading">
              <div>
                <h3>✦ Mentor Recommendations</h3>
                <p>Suggested areas to review based on student data</p>
              </div>

              <button
                className="pp-text-btn"
                onClick={() => setActiveTab("analytics")}
              >
                View analytics →
              </button>
            </div>

            <div className="pp-recommendation-grid">
              {recommendations.slice(0, 3).map((item) => (
                <div
                  className={`pp-recommendation ${item.type}`}
                  key={item.id}
                >
                  <strong>{item.title}</strong>
                  <span>{item.student}</span>
                  <p>{item.message}</p>
                </div>
              ))}

              {recommendations.length === 0 && (
                <p>No recommendations available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROBATION TRACKING */}
      {activeTab === "tracking" && (
        <div className="pp-content">
          <div className="pp-section-heading">
            <div>
              <h2>Probation Tracking</h2>
              <p>Track the progress and performance of every student.</p>
            </div>

            <span className="pp-total-label">
              {filteredStudents.length} Students
            </span>
          </div>

          {/* Search and Filter */}
          <div className="pp-filter-bar">
            <div className="pp-search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search student or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="On Track">On Track</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>

          {/* Student Cards */}
          <div className="pp-student-grid">
            {filteredStudents.map((student) => (
              <div className="pp-student-card" key={student.id}>
                <div className="pp-card-top">
                  <div className="pp-avatar pp-avatar-large">
                    {student.avatar}
                  </div>

                  <StatusBadge status={student.status} />
                </div>

                <div className="pp-card-student-info">
                  <h3>{student.name}</h3>
                  <p>{student.role}</p>
                  <small>{student.email}</small>
                </div>

                <div className="pp-card-progress">
                  <div className="pp-summary-label">
                    <span>Overall Progress</span>
                    <strong>{student.progress}%</strong>
                  </div>

                  <ProgressBar value={student.progress} />
                </div>

                <div className="pp-student-metrics">
                  <div>
                    <span>Tasks</span>
                    <strong>
                      {student.completedTasks}/{student.totalTasks}
                    </strong>
                  </div>

                  <div>
                    <span>Attendance</span>
                    <strong>{student.attendance}%</strong>
                  </div>

                  <div>
                    <span>Project Score</span>
                    <strong>{student.projectScore}/10</strong>
                  </div>
                </div>

                <div className="pp-card-actions">
                  <button
                    className="pp-primary-btn pp-full-btn"
                    onClick={() => openFeedback(student)}
                  >
                    View / Add Feedback
                  </button>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="pp-empty-state">
                <h3>No students found</h3>
                <p>Try changing your search or filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="pp-content">
          <div className="pp-section-heading">
            <div>
              <h2>Mentor Analytics</h2>
              <p>Analyze overall student performance and progress.</p>
            </div>

            <span className="pp-session-badge">
              Recruitment 2026
            </span>
          </div>

          <div className="pp-stats-grid">
            <StatCard
              icon="♙"
              label="Students"
              value={totalStudents}
              description="Total probation students"
              color="#477f91"
            />

            <StatCard
              icon="◴"
              label="Attendance"
              value={`${averageAttendance}%`}
              description="Average attendance"
              color="#16a085"
            />

            <StatCard
              icon="★"
              label="Project Score"
              value={`${averageScore}/10`}
              description="Average evaluation"
              color="#e6a23c"
            />

            <StatCard
              icon="✓"
              label="Task Completion"
              value={`${totalTasks ? Math.round(
                (completedTasks / totalTasks) * 100
              ) : 0}%`}
              description="Overall task completion"
              color="#e56b8a"
            />
          </div>

          <div className="pp-analytics-grid">
            {/* Bar Chart */}
            <div className="pp-panel">
              <div className="pp-panel-heading">
                <div>
                  <h3>Student Performance Comparison</h3>
                  <p>Progress percentage by student</p>
                </div>
              </div>

              <div className="pp-bar-chart">
                {students.map((student) => (
                  <div className="pp-chart-column" key={student.id}>
                    <strong>{student.progress}%</strong>

                    <div className="pp-chart-bar-area">
                      <div
                        className="pp-chart-bar"
                        style={{
                          height: `${student.progress}%`,
                          background:
                            student.status === "At Risk"
                              ? "#e56b8a"
                              : student.status === "Needs Attention"
                              ? "#e6a23c"
                              : "#477f91",
                        }}
                      />
                    </div>

                    <span>{student.avatar}</span>
                  </div>
                ))}
              </div>

              <div className="pp-chart-legend">
                <span><i className="legend-primary" /> On Track</span>
                <span><i className="legend-orange" /> Needs Attention</span>
                <span><i className="legend-red" /> At Risk</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="pp-panel">
              <div className="pp-panel-heading">
                <div>
                  <h3>Performance Indicators</h3>
                  <p>Overall probation statistics</p>
                </div>
              </div>

              {analyticsData.map((item) => (
                <div className="pp-summary-item" key={item.label}>
                  <div className="pp-summary-label">
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>

                  <ProgressBar
                    value={item.value}
                    color={item.color}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Student Distribution */}
          <div className="pp-panel">
            <div className="pp-panel-heading">
              <div>
                <h3>Student Status Distribution</h3>
                <p>Current probation status breakdown</p>
              </div>
            </div>

            <div className="pp-distribution">
              {[
                {
                  label: "On Track",
                  count: students.filter(
                    (s) => s.status === "On Track"
                  ).length,
                  color: "#16a085",
                },
                {
                  label: "Needs Attention",
                  count: students.filter(
                    (s) => s.status === "Needs Attention"
                  ).length,
                  color: "#e6a23c",
                },
                {
                  label: "At Risk",
                  count: students.filter(
                    (s) => s.status === "At Risk"
                  ).length,
                  color: "#e56b8a",
                },
              ].map((item) => (
                <div className="pp-distribution-item" key={item.label}>
                  <div className="pp-distribution-heading">
                    <span>
                      <i style={{ background: item.color }} />
                      {item.label}
                    </span>

                    <strong>{item.count} Students</strong>
                  </div>

                  <ProgressBar
                    value={
                      totalStudents
                        ? (item.count / totalStudents) * 100
                        : 0
                    }
                    color={item.color}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="pp-panel pp-ai-panel">
            <div className="pp-ai-heading">
              <div className="pp-ai-icon">✦</div>
              <div>
                <h3>AI Performance Insights</h3>
                <p>Suggested mentor actions based on current records</p>
              </div>
            </div>

            <div className="pp-ai-list">
              {recommendations.map((item) => (
                <div
                  className={`pp-ai-item ${item.type}`}
                  key={item.id}
                >
                  <div>
                    <strong>{item.student}</strong>
                    <span>{item.title}</span>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}

              {recommendations.length === 0 && (
                <p>No insights available yet.</p>
              )}
            </div>

            <small className="pp-demo-note">
              These are rule-based sample insights, not a connected AI model.
              Final evaluation should always be done by mentors.
            </small>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedback && selectedStudent && (
        <div
          className="pp-modal-overlay"
          onClick={() => setShowFeedback(false)}
        >
          <div
            className="pp-feedback-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pp-modal-heading">
              <div>
                <h2>Student Feedback</h2>
                <p>{selectedStudent.name}</p>
              </div>

              <button
                className="pp-close-btn"
                onClick={() => setShowFeedback(false)}
              >
                ×
              </button>
            </div>

            <div className="pp-modal-stats">
              <div>
                <span>Progress</span>
                <strong>{selectedStudent.progress}%</strong>
              </div>

              <div>
                <span>Attendance</span>
                <strong>{selectedStudent.attendance}%</strong>
              </div>

              <div>
                <span>Project Score</span>
                <strong>{selectedStudent.projectScore}/10</strong>
              </div>
            </div>

            <label htmlFor="mentorFeedback">
              Mentor's feedback
            </label>

            <textarea
              id="mentorFeedback"
              rows="5"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback, suggestions or improvement areas..."
            />

            <div className="pp-modal-actions">
              <button
                className="pp-secondary-btn"
                onClick={() => setShowFeedback(false)}
              >
                Cancel
              </button>

              <button
                className="pp-primary-btn"
                onClick={saveFeedback}
              >
                Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
