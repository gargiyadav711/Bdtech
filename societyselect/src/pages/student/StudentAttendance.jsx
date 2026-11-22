import { useState } from "react";
import {CalendarDays,CheckCircle2,XCircle,Clock,TrendingUp,Filter,ClipboardCheck,} from "lucide-react";
import "../StudentAttendance.css";

function StudentAttendance() {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const attendanceRecords = [
    { id: 1, society: "A Club", date: "2026-11-19", day: "Thursday", time: "09:00 AM", status: "Present" },
    ];

  const present = attendanceRecords.filter(
    (item) => item.status === "Present"
  ).length;

  const absent = attendanceRecords.filter(
    (item) => item.status === "Absent"
  ).length;

  const late = attendanceRecords.filter(
    (item) => item.status === "Late"
  ).length;

  const total = attendanceRecords.length;

  const percentage = Math.round(
    ((present + late) / total) * 100
  );

  const filteredRecords = attendanceRecords.filter((item) => {
    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;

    const matchesMonth =
      selectedMonth === "All" ||
      item.date.slice(5, 7) === selectedMonth;

    return matchesStatus && matchesMonth;
  });

  const getStatusClass = (status) => {
    if (status === "Present") return "student-status-present";
    if (status === "Absent") return "student-status-absent";
    return "student-status-late";
  };

  return (
    <div className="student-attendance">
      <div className="student-attendance-header">
        <div>
          <h1>My Attendance</h1>
        </div>

        <div className="student-attendance-date">
          <CalendarDays size={18} />
          November 2026
        </div>
      </div>
      <div className="student-attendance-stats">

        <div className="student-attendance-card">
          <div className="student-attendance-icon blue">
            <ClipboardCheck size={22} />
          </div>
          <p>Total Sessions</p>
          <h2>{total}</h2>
          <span>Recorded sessions</span>
        </div>

        <div className="student-attendance-card">
          <div className="student-attendance-icon green">
            <CheckCircle2 size={22} />
          </div>
          <p>Present</p>
          <h2>{present}</h2>
          <span>Sessions attended</span>
        </div>

        <div className="student-attendance-card">
          <div className="student-attendance-icon red">
            <XCircle size={22} />
          </div>
          <p>Absent</p>
          <h2>{absent}</h2>
          <span>Sessions missed</span>
        </div>
      </div>
      <div className="student-attendance-overview">

        <div className="student-attendance-overview-left">
          <div>
            <h3>Overall Attendance</h3>
          </div>
        </div>

        <div className="student-attendance-progress">
          <div className="student-attendance-progress-info">
            <h2>{percentage}%</h2>
          </div>

          <div className="student-progress-track">
            <div
              className="student-progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <span className="student-attendance-note">
            {percentage >= 75
              ? "Great! You are maintaining good attendance."
              : "Your attendance is below the recommended 75%."}
          </span>
        </div>

      </div>
      <div className="student-attendance-history">

        <div className="student-attendance-history-header">
          <div>
            <h2>Attendance History</h2>
          </div>
        </div>
        <div className="student-attendance-filters">
          <div className="student-attendance-filter">
            <CalendarDays size={17} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              <option value="11">November 2026</option>
              <option value="10">October 2026</option>
            </select>
          </div>

          <div className="student-attendance-filter">
            <Filter size={17} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>

        </div>

        <div className="student-attendance-table-wrapper">
          <table className="student-attendance-table">
            <thead>
              <tr>
                <th>Society</th>
                <th>Date</th>
                <th>Day</th>
                <th>Check-in Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.society}</strong>
                    </td>
                    <td>
                      {new Date(record.date + "T00:00:00").toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td>{record.day}</td>
                    <td>{record.time}</td>
                    <td>
                      <span className={`student-attendance-status ${getStatusClass(record.status)}`}>
                        {record.status === "Present" ? (
                          <CheckCircle2 size={14} />
                        ) : record.status === "Absent" ? (
                          <XCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="student-attendance-empty">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="student-attendance-footer">
          Showing {filteredRecords.length} of {total} records
        </div>

      </div>

    </div>
  );
}

export default StudentAttendance;
