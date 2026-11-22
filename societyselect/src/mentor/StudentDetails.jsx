import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  Code2,
  FolderKanban,
  GraduationCap,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import { navigateTo } from "../utils/navigation";
import "./StudentDetails.css";

const getStudentIdFromUrl = () => {
  const hashMatch = (window.location.hash || "").match(/students\/([^/?]+)/i);
  if (hashMatch) return hashMatch[1];

  const pathMatch = window.location.pathname.match(/students\/([^/?]+)/i);
  if (pathMatch) return pathMatch[1];

  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("id") || searchParams.get("studentId") || "";
};

const showValue = (value) => (
  value && String(value).trim() ? value : "Not added yet"
);

function StudentDetails() {
  const [studentId, setStudentId] = useState(getStudentIdFromUrl);
  const [details, setDetails] = useState(null);
  const [loadedStudentId, setLoadedStudentId] = useState("");
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const loading = Boolean(studentId) && loadedStudentId !== studentId;
  const visibleError = !studentId
    ? "A student ID is required."
    : loadedStudentId === studentId
      ? error
      : "";

  useEffect(() => {
    const handleUrlChange = () => setStudentId(getStudentIdFromUrl());
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!studentId) return undefined;

    apiRequest(`/api/mentor/students/${encodeURIComponent(studentId)}`)
      .then((data) => {
        if (active) {
          setDetails(data);
          setError("");
          setLoadedStudentId(studentId);
        }
      })
      .catch((requestError) => {
        if (active) {
          setDetails(null);
          setError(requestError.message);
          setLoadedStudentId(studentId);
        }
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  const currentDetails = loadedStudentId === studentId ? details : null;
  const student = currentDetails?.student;

  const updateProbationStatus = async (event) => {
    const probationStatus = event.target.value;
    setStatusSaving(true);
    setError("");
    try {
      const response = await apiRequest(
        `/api/mentor/students/${encodeURIComponent(studentId)}/status`,
        { method: "PATCH", body: { probationStatus } }
      );
      setDetails((current) => ({ ...current, student: response.student }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  if (!student) {
    return (
      <div className="student-details-layout">
        <MentorSidebar />
        <main className="student-details-page">
          <button
            type="button"
            className="student-back-btn"
            onClick={() => navigateTo("/mentor/students")}
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>
          <div className="student-not-found">
            <h2>Student not found</h2>
            {visibleError ? <p role="alert">{visibleError}</p> : null}
          </div>
        </main>
      </div>
    );
  }

  const initials = student.fullName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const application = details.application;
  const githubUrl = student.githubUrl || application?.githubUrl;

  return (
    <div className="student-details-layout">
      <MentorSidebar />
      <main className="student-details-page">
        <div className="student-details-topbar">
          <button
            type="button"
            className="student-back-btn"
            onClick={() => navigateTo("/mentor/students")}
          >
            <ArrowLeft size={17} />
            Back to Students
          </button>
          <span className="student-profile-label">STUDENT PROFILE</span>
        </div>

        <div className="student-social-profile-card">
          <div className="student-social-card-header">
            <div className="student-social-avatar"><span>{initials}</span></div>
            <div className="student-social-user-info">
              <h3>{student.fullName}</h3>
              <p>{showValue(student.domain)}</p>
              <label>
                Probation status
                <select
                  value={student.probationStatus || "APPLICANT"}
                  onChange={updateProbationStatus}
                  disabled={statusSaving}
                >
                  <option value="APPLICANT">Applicant</option>
                  <option value="ON_PROBATION">On probation</option>
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </label>
            </div>
          </div>

          <div className="student-social-description">
            <div className="social-description-heading"><h3>About Student</h3></div>
            <div className="social-detail-item"><Mail size={16} /><span>{showValue(student.email)}</span></div>
            <div className="social-detail-item"><Phone size={16} /><span>{showValue(student.phone)}</span></div>
            <div className="social-detail-item"><Code2 size={16} /><span>Branch: {showValue(student.branch)}</span></div>
            <div className="social-detail-item">
              <GraduationCap size={16} />
              <span>Year: {showValue(student.year)} | Roll Number: {showValue(student.rollNo)}</span>
            </div>
            {student.bio ? <p>{student.bio}</p> : null}
            {visibleError ? <p role="alert">{visibleError}</p> : null}

            {application?.whyJoin ? (
              <div className="social-extra-details">
                <h4>Application motivation</h4>
                <p>{application.whyJoin}</p>
              </div>
            ) : null}

            <div className="social-description-divider" />
            <div className="social-extra-details">
              <h4><Code2 size={16} />Technical Skills</h4>
              <div className="social-detail-tags">
                {skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span>Not added yet</span>}
              </div>
            </div>

            <div className="social-description-divider" />
            <div className="social-extra-details">
              <h4><FolderKanban size={16} />Task Submissions</h4>
              {details.submissions?.length ? details.submissions.map((item) => (
                <div className="social-project-item" key={item.taskId}>
                  <strong>{item.title}</strong>
                  <p>Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString() : "Not set"}</p>
                  <p>Status: {item.submission?.status || "Not submitted"}</p>
                  {item.submission?.repoUrl ? <a href={item.submission.repoUrl} target="_blank" rel="noreferrer">Repository</a> : null}
                  {item.submission?.liveUrl ? <a href={item.submission.liveUrl} target="_blank" rel="noreferrer">Live project</a> : null}
                  {item.submission?.marksObtained !== null && item.submission?.marksObtained !== undefined ? <p>Score: {item.submission.marksObtained}/{item.maxMarks}</p> : null}
                  {item.submission?.mentorFeedback ? <p>Feedback: {item.submission.mentorFeedback}</p> : null}
                </div>
              )) : <p>No domain tasks found.</p>}
            </div>

            {application?.experience ? (
              <>
                <div className="social-description-divider" />
                <div className="social-extra-details">
                  <h4><Award size={16} />Experience</h4>
                  <p>{application.experience}</p>
                </div>
              </>
            ) : null}
          </div>

          <div className="student-social-links">
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noreferrer" title="GitHub" aria-label="GitHub"><FaGithub /></a>
            ) : null}
            {application?.portfolioUrl ? (
              <a href={application.portfolioUrl} target="_blank" rel="noreferrer" title="Portfolio" aria-label="Portfolio"><Globe /></a>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDetails;
