import { useState } from "react";
import {Sparkles,Users,TrendingUp,AlertTriangle,CheckCircle2,Clock,BookOpen,CalendarCheck,FolderKanban,ChevronRight,Lightbulb,Target,RefreshCw,X,CircleAlert,} from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import "./AIRecommendations.css";
function AIRecommendations() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewedStudents, setReviewedStudents] = useState([]);
  const recommendations = [
    {
      id: 1,
      name: "Gargi",
      rollNo: "AKGEC2025001",
      branch: "CSE",
      year: "2nd Year",
      avatar: "GY",
      risk: "High",
      score: 38,
      attendance: 62,
      academicScore: 42,
      projectScore: 35,
      examScore: 30,
      concerns: [
        "Attendance is below the required threshold.",
        "Low performance in recent assessments.",
        "Two project submissions are pending.",
      ],
      suggestions: [
        {
          title: "Schedule an individual mentoring session",
          description:
            "Discuss academic difficulties and identify the reasons behind the student's low performance.",
          category: "Mentoring",
          priority: "High",
        },
        {
          title: "Create an attendance improvement plan",
          description:
            "Monitor attendance weekly and set a target of at least 75%.",
          category: "Attendance",
          priority: "High",
        },
        {
          title: "Provide additional DSA practice",
          description:
            "Assign beginner and intermediate-level DSA problems to improve technical understanding.",
          category: "Academics",
          priority: "Medium",
        },
        {
          title: "Review pending project submissions",
          description:
            "Set individual deadlines for the two incomplete projects.",
          category: "Projects",
          priority: "Medium",
        },
      ],
      improvement: "Needs immediate attention",
    },
  ];

  const highRisk = recommendations.filter(
    (student) => student.risk === "High"
  ).length;

  const mediumRisk = recommendations.filter(
    (student) => student.risk === "Medium"
  ).length;

  const averageScore = Math.round(
    recommendations.reduce(
      (sum, student) => sum + student.score,
      0
    ) / recommendations.length
  );

  const markAsReviewed = (studentId) => {
    setReviewedStudents((previous) =>
      previous.includes(studentId)
        ? previous.filter((id) => id !== studentId)
        : [...previous, studentId]
    );
  };

  const getRiskClass = (risk) => {
    if (risk === "High") return "high";
    if (risk === "Medium") return "medium";
    return "low";
  };

  const getRiskIcon = (risk) => {
    if (risk === "High") return <AlertTriangle size={16} />;
    if (risk === "Medium") return <CircleAlert size={16} />;
    return <CheckCircle2 size={16} />;
  };

  return (
    <div className="ai-recommendation-page">
      <MentorSidebar />

      <main className="ai-main-content">

        {/* Page Header */}
        <div className="ai-page-header">
          <div>
            <div className="ai-heading-label">
              <Sparkles size={15} />
              INTELLIGENT STUDENT INSIGHTS
            </div>

            <h1>AI Recommendations</h1>
          </div>

          <button className="ai-refresh-btn" type="button">
            <RefreshCw size={17} />
            Refresh Insights
          </button>
        </div>
        <div className="ai-stats-grid">
          <div className="ai-stat-card">
            <div>
              <p>Total Analyzed Students</p>
              <h2>{recommendations.length}</h2>
              <span>Students reviewed by the system</span>
            </div>
          </div>

          <div className="ai-stat-card">
            <div>
              <p>High Risk Students</p>
              <h2>{highRisk}</h2>
              <span>Require immediate attention</span>
            </div>
          </div>

          <div className="ai-stat-card">
            <div>
              <p>Medium Risk Students</p>
              <h2>{mediumRisk}</h2>
              <span>Need regular monitoring</span>
            </div>
          </div>

          <div className="ai-stat-card">
            <div>
              <p>Average Performance</p>
              <h2>{averageScore}%</h2>
              <span>Across analyzed students</span>
            </div>
          </div>

        </div>
        <section className="ai-students-section">
          <div className="ai-section-heading">
            <div>
              <h2>Student Recommendations</h2>
            </div>
          </div>
          <div className="ai-student-list">
            {recommendations.map((student) => (
              <div className="ai-student-card" key={student.id}>
                <div className="ai-student-top">
                  <div className="ai-student-info">
                    <div className="ai-student-avatar">
                      {student.avatar}
                    </div>
                    <div>
                      <h3>{student.name}</h3>
                      <p>
                        {student.rollNo} <span>•</span>{" "}
                        {student.branch} <span>•</span> {student.year}
                      </p>
                    </div>
                  </div>
                  <div className="ai-student-badges">
                    <span
                      className={`ai-risk-badge ${getRiskClass(student.risk)}`}
                    >
                      {getRiskIcon(student.risk)}
                      {student.risk} Risk
                    </span>

                    {reviewedStudents.includes(student.id) && (
                      <span className="ai-reviewed-badge">
                        <CheckCircle2 size={14} />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>
                <div className="ai-student-performance">
                  <div className="ai-performance-score">
                    <span>Overall Score</span>
                    <strong>{student.score}%</strong>
                  </div>
                  <div className="ai-performance-metric">
                    <div>
                      <span>
                        <CalendarCheck size={14} />
                        Attendance
                      </span>
                      <strong>{student.attendance}%</strong>
                    </div>

                    <div className="ai-mini-track">
                      <div
                        style={{ width: `${student.attendance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="ai-performance-metric">
                    <div>
                      <span>
                        <BookOpen size={14} />
                        Academics
                      </span>
                      <strong>{student.academicScore}%</strong>
                    </div>

                    <div className="ai-mini-track">
                      <div
                        style={{ width: `${student.academicScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="ai-performance-metric">
                    <div>
                      <span>
                        <FolderKanban size={14} />
                        Projects
                      </span>
                      <strong>{student.projectScore}%</strong>
                    </div>

                    <div className="ai-mini-track">
                      <div
                        style={{ width: `${student.projectScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="ai-performance-metric">
                    <div>
                      <span>
                        <Target size={14} />
                        Examinations
                      </span>
                      <strong>{student.examScore}%</strong>
                    </div>

                    <div className="ai-mini-track">
                      <div
                        style={{ width: `${student.examScore}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
                <div className="ai-student-insight">
                  <div className="ai-insight-heading">
                    <Lightbulb size={17} />
                    <strong>AI Insight</strong>
                  </div>
                  <p>{student.improvement}</p>

                  <div className="ai-concern-list">
                    {student.concerns.map((concern, index) => (
                      <div key={index}>
                        <CircleAlert size={14} />
                        <span>{concern}</span>
                      </div>
                    ))}
                  </div>

                </div>
                <div className="ai-student-footer">

                  <span>
                    <Sparkles size={15} />
                    {student.suggestions.length} recommendations
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedStudent(student)}
                  >
                    View Recommendations
                    <ChevronRight size={17} />
                  </button>

                </div>

              </div>
            ))}

          </div>
        </section>
        {selectedStudent && (
          <div
            className="ai-modal-overlay"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className="ai-recommendation-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="ai-modal-header">
                <div>
                  <div className="ai-modal-label">
                    <Sparkles size={15} />
                    PERSONALIZED AI INSIGHTS
                  </div>

                  <h2>Student Recommendations</h2>

                  <p>
                    Suggested improvement plan for{" "}
                    {selectedStudent.name}
                  </p>
                </div>

                <button
                  type="button"
                  className="ai-modal-close"
                  onClick={() => setSelectedStudent(null)}
                >
                  <X size={21} />
                </button>
              </div>
              <div className="ai-modal-student">

                <div className="ai-student-avatar">
                  {selectedStudent.avatar}
                </div>

                <div>
                  <h3>{selectedStudent.name}</h3>
                  <p>
                    {selectedStudent.rollNo} · {selectedStudent.branch}
                  </p>
                </div>

                <span
                  className={`ai-risk-badge ${getRiskClass(
                    selectedStudent.risk
                  )}`}
                >
                  {selectedStudent.risk} Risk
                </span>

              </div>
              <div className="ai-modal-score">
                <div>
                  <span>Overall Performance</span>
                  <strong>{selectedStudent.score}%</strong>
                </div>
                <div>
                  <span>Attendance</span>
                  <strong>{selectedStudent.attendance}%</strong>
                </div>
                <div>
                  <span>Exam Score</span>
                  <strong>{selectedStudent.examScore}%</strong>
                </div>
              </div>
              <div className="ai-modal-concerns">
                <h3>
                  <AlertTriangle size={17} />
                  Identified Concerns
                </h3>
                {selectedStudent.concerns.map((concern, index) => (
                  <div key={index}>
                    <CircleAlert size={15} />
                    {concern}
                  </div>
                ))}

              </div>
              <div className="ai-modal-suggestions">
                <h3>
                  <Lightbulb size={18} />
                  Recommended Actions
                </h3>
                {selectedStudent.suggestions.map((suggestion, index) => (
                  <div className="ai-suggestion-card" key={index}>
                    <div className="ai-suggestion-number">
                      {index + 1}
                    </div>
                    <div className="ai-suggestion-content">
                      <div className="ai-suggestion-title">
                        <h4>{suggestion.title}</h4>
                        <span
                          className={`ai-priority ${suggestion.priority.toLowerCase()}`}
                        >
                          {suggestion.priority}
                        </span>
                      </div>

                      <p>{suggestion.description}</p>

                      <span className="ai-suggestion-category">
                        {suggestion.category}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
              <div className="ai-modal-footer">

                <button
                  type="button"
                  className="ai-modal-secondary"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="ai-modal-primary"
                  onClick={() => {
                    markAsReviewed(selectedStudent.id);
                    setSelectedStudent(null);
                  }}
                >
                  <CheckCircle2 size={17} />

                  {reviewedStudents.includes(selectedStudent.id)
                    ? "Mark as Unreviewed"
                    : "Mark as Reviewed"}
                </button>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AIRecommendations;
