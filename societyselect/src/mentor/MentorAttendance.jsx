import { useState } from "react";
import {Search,CalendarDays,Clock,Play,Square,CheckCircle2,XCircle,ClipboardCheck,} from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import "./MentorAttendance.css";

const initialStudents = [
  {
    id: 1,
    name: "Gargi Yadav",
    rollNo: "2510091",
    year: "2nd Year",
    status: "Present",
  },
];

function MentorAttendance() {
  const [students, setStudents] = useState(initialStudents);
  const [session, setSession] = useState({
    isOpen: false,
    date: "",
    startTime: "",
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [history, setHistory] = useState([]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || student.status === filter;

    return matchesSearch && matchesFilter;
  });

  const startSession = () => {
    if (session.isOpen) return;

    const now = new Date();

    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const startTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Pending",
      }))
    );

    setSession({
      isOpen: true,
      date,
      startTime,
    });
  };

  const markAttendance = (id, status) => {
    if (!session.isOpen) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const closeSession = () => {
    if (!session.isOpen) return;

    const now = new Date();

    const finalPresent = students.filter(
      (student) => student.status === "Present"
    ).length;

    const finalAbsent = students.filter(
      (student) => student.status !== "Present"
    ).length;

    const record = {
      id: Date.now(),
      date: session.date,
      startTime: session.startTime,
      endTime: now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: students.length,
      present: finalPresent,
      absent: finalAbsent,
      percentage: students.length
        ? Math.round((finalPresent / students.length) * 100)
        : 0,
    };

    setHistory((prev) => [record, ...prev]);

    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: student.status === "Present" ? "Present" : "Absent",
      }))
    );

    setSession({
      isOpen: false,
      date: "",
      startTime: "",
    });
  };

  return (
    <div className="mentor-attendance-layout">
      <MentorSidebar />

      <main className="mentor-attendance-page">
        <div className="attendance-page-header">
          <div>
            <h1>Attendance Management</h1>
          </div>

          <div className="attendance-date-badge">
            <CalendarDays size={18} />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="attendance-session-card">
          <div className="attendance-session-info">
            <div className="attendance-session-icon">
              <ClipboardCheck size={23} />
            </div>

            <div>
              <h3>Attendance Session</h3>
              <p>
                {session.isOpen
                  ? `Session started on ${session.date} at ${session.startTime}`
                  : "Start a session to record today's student attendance."}
              </p>
            </div>
          </div>

          <div className="attendance-session-actions">
            <span
              className={`attendance-session-status ${
                session.isOpen ? "live" : "inactive"
              }`}
            >
              <span className="attendance-status-dot"></span>
              {session.isOpen ? "Session Active" : "No Active Session"}
            </span>

            {session.isOpen ? (
              <button
                className="attendance-close-btn"
                onClick={closeSession}
              >
                <Square size={15} />
                Close Session
              </button>
            ) : (
              <button
                className="attendance-start-btn"
                onClick={startSession}
              >
                <Play size={16} fill="currentColor" />
                Start Attendance
              </button>
            )}
          </div>
        </div>

        <div className="attendance-table-card">
          <div className="attendance-table-header">
            <div className="attendance-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="attendance-filter-tabs">
            {["All", "Present", "Absent", "Pending"].map((item) => (
              <button
                key={item}
                className={`attendance-filter-btn ${
                  filter === item ? "active" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
                <span>
                  {item === "All"
                    ? students.length
                    : students.filter((s) => s.status === item).length}
                </span>
              </button>
            ))}
          </div>

          <div className="attendance-table-scroll">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>ROLL NUMBER</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="attendance-student-cell">
                          <div className="attendance-student-avatar">
                            {student.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{student.name}</strong>
                            <small>{student.year}</small>
                          </div>
                        </div>
                      </td>

                      <td>{student.rollNo}</td>

                      <td>
                        <span
                          className={`attendance-status-badge ${student.status.toLowerCase()}`}
                        >
                          {student.status === "Present" ? (
                            <CheckCircle2 size={14} />
                          ) : student.status === "Absent" ? (
                            <XCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {student.status}
                        </span>
                      </td>

                      <td>
                        <div className="attendance-action-buttons">
                          <button
                            className="mark-present-btn"
                            disabled={!session.isOpen}
                            onClick={() =>
                              markAttendance(student.id, "Present")
                            }
                            title="Mark Present"
                          >
                            <CheckCircle2 size={16} />
                          </button>

                          <button
                            className="mark-absent-btn"
                            disabled={!session.isOpen}
                            onClick={() =>
                              markAttendance(student.id, "Absent")
                            }
                            title="Mark Absent"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="attendance-empty">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="attendance-history-card">
          <div className="attendance-history-heading">
            <div>
              <h3>Attendance History</h3>
            </div>
          </div>

          {history.length ? (
            <div className="attendance-history-list">
              {history.map((record) => (
                <div className="attendance-history-item" key={record.id}>
                  <div className="attendance-history-date-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div className="attendance-history-details">
                    <strong>{record.date}</strong>
                    <span>
                      <Clock size={13} />
                      {record.startTime} – {record.endTime}
                    </span>
                  </div>

                  <div className="attendance-history-counts">
                    <span className="history-present">
                      {record.present} Present
                    </span>
                    <span className="history-absent">
                      {record.absent} Absent
                    </span>
                  </div>

                  <div className="attendance-history-rate">
                    <strong>{record.percentage}%</strong>
                    <span>Attendance</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="attendance-history-empty">
              <CalendarDays size={25} />
              <p>No attendance history available yet.</p>
              <span>Your closed sessions will appear here.</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MentorAttendance;
