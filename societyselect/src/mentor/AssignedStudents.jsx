import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, SlidersHorizontal, Users } from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import { navigateTo } from "../utils/navigation";
import "./AssignedStudents.css";

function AssignedStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/mentor/students")
      .then((data) => {
        if (active) setStudents(data.students || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [
        student.fullName,
        student.societyName,
        student.email,
        student.branch,
        student.studentNumber,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));

      const matchesStatus =
        statusFilter === "All" || student.probationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const handleViewProfile = (student) => {
    navigateTo(`/mentor/students/${student._id}`);
  };

  const handleMessage = (e, student) => {
    e.stopPropagation();
    alert(`No messaging service is connected for ${student.fullName}.`);
  };

  if (loading) return <LoadingPage />;

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
                  <option value="APPLICANT">Applicant</option>
                  <option value="ON_PROBATION">On probation</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {error ? <p role="alert">{error}</p> : null}
            {!error ? (
              <div className="assigned-student-grid">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <article
                    className="assigned-student-card"
                    key={student._id}
                    onClick={() => handleViewProfile(student)}
                    style={{ cursor: "pointer" }}
                  >

                    <div className="assigned-student-info">
                      <h3>{student.fullName}</h3>
                      <p>{student.email}</p>
                    </div>

                    <div className="assigned-card-actions">
                      <button
                        type="button"
                        className="assigned-view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(student);
                        }}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="assigned-message-btn"
                        onClick={(e) => handleMessage(e, student)}
                        aria-label={`Message ${student.fullName}`}
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
                  <p>Try adjusting your search or status filter.</p>
                </div>
              )}
              </div>
            ) : null}
          </section>
        </section>
      </main>
    </div>
  );
}

export default AssignedStudents;
