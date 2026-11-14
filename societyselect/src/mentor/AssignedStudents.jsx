import { useMemo, useState } from "react";
import { Users, Search, Eye, MessageCircle, SlidersHorizontal } from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import "./AssignedStudents.css";

const studentData = [
  {
    id: 1,
    name: "Gargi Yadav",
    society: "A Society",
    email: "gargi@example.com",
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Tiwari",
    society: "A Society",
    email: "priya@example.com",
    status: "Active",
  },
  {
    id: 3,
    name: "Aastha",
    society: "A Society",
    email: "aastha@example.com",
    status: "Pending",
  },
];

function AssignedStudents() {
  const [students] = useState(studentData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.society.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const handleViewProfile = (student) => {
    alert(`Viewing profile of ${student.name}`);
  };

  const handleMessage = (student) => {
    alert(`Opening conversation with ${student.name}`);
  };

  return (
    <div className="assigned-page">
      <MentorSidebar />
      <main className="assigned-main">
        <section className="assigned-content">
          <div className="assigned-heading">
            <div>
              <h1>Assigned Students</h1>
              <p>
                Keep track of your students, monitor their progress,
                and guide them towards success.
              </p>
            </div>
            <div className="assigned-heading-icon">
              <Users size={30} />
            </div>
          </div>

          <section className="assigned-student-section">
            <div className="assigned-section-heading">
              <div>
                <h2>Your Students</h2>
                <p>
                  You currently have {students.length} students assigned
                  to you.
                </p>
              </div>
            </div>
            <div className="assigned-toolbar">
              <div className="assigned-search">
                <Search size={19} />

                <input
                  type="text"
                  placeholder="Search by student name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="assigned-filter">
                <SlidersHorizontal size={17} />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="assigned-student-grid">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <article
                    className="assigned-student-card"
                    key={student.id}
                  >
                    <div className="assigned-student-info">
                      <h3>{student.name}</h3>
                    </div>

                    <div className="assigned-card-actions">
                      <button
                        className="assigned-view-btn"
                        onClick={() => handleViewProfile(student)}
                      >
                        <Eye size={16} />
                        View Profile
                      </button>

                      <button
                        className="assigned-message-btn"
                        onClick={() => handleMessage(student)}
                        aria-label={`Message ${student.name}`}
                      >
                        <MessageCircle size={17} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="assigned-empty-state">
                  <Users size={34} />
                  <h3>No students found</h3>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default AssignedStudents;