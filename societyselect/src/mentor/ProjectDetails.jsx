import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  GitBranch,
  Globe,
  Users,
} from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import { navigateTo } from "../utils/navigation";
import "../pages/student/StudentApiPages.css";
import "./ProjectDetails.css";

const getTaskIdFromUrl = () => window.location.pathname.split("/").filter(Boolean).pop() || "";

function ProjectDetails() {
  const [taskId, setTaskId] = useState(getTaskIdFromUrl);
  const [task, setTask] = useState(null);
  const [loadedTaskId, setLoadedTaskId] = useState("");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState({});
  const loading = Boolean(taskId) && loadedTaskId !== taskId;
  const visibleTask = loadedTaskId === taskId ? task : null;
  const visibleError = !taskId
    ? "A task ID is required."
    : loadedTaskId === taskId
      ? error
      : "";

  useEffect(() => {
    const handleUrlChange = () => setTaskId(getTaskIdFromUrl());
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!taskId) return undefined;

    apiRequest("/api/mentor/tasks")
      .then((data) => {
        const foundTask = data.tasks?.find((item) => String(item._id) === taskId);
        if (active) {
          setTask(foundTask || null);
          setError("");
          setLoadedTaskId(taskId);
          if (!foundTask) setError("Task not found in your domain.");
        }
      })
      .catch((requestError) => {
        if (active) {
          setTask(null);
          setError(requestError.message);
          setLoadedTaskId(taskId);
        }
      });

    return () => {
      active = false;
    };
  }, [taskId]);

  const getDraft = (submission) => {
    const id = String(submission.student?._id || submission.student);
    return drafts[id] || {
      status: submission.status === "REVISION_REQUESTED" ? "REVISION_REQUESTED" : "GRADED",
      marksObtained: submission.marksObtained ?? "",
      mentorFeedback: submission.mentorFeedback || "",
    };
  };

  const updateDraft = (studentId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [studentId]: { ...current[studentId], [field]: value },
    }));
  };

  const reviewSubmission = async (event, submission) => {
    event.preventDefault();
    const studentId = String(submission.student?._id || submission.student);
    const draft = getDraft(submission);
    setError("");
    setMessage("");
    setSavingId(studentId);

    try {
      const body = {
        status: draft.status,
        marksObtained: draft.marksObtained === "" ? null : Number(draft.marksObtained),
        mentorFeedback: draft.mentorFeedback,
      };
      const response = await apiRequest(
        `/api/mentor/tasks/${encodeURIComponent(task._id)}/submissions/${encodeURIComponent(studentId)}`,
        { method: "PATCH", body }
      );
      setTask((current) => ({
        ...current,
        submissions: current.submissions.map((item) =>
          String(item.student?._id || item.student) === studentId
            ? { ...item, ...response.submission, student: item.student }
            : item
        ),
      }));
      setMessage(`Review saved for ${submission.student?.fullName || "student"}.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="project-details-layout">
      <MentorSidebar />
      <main className="project-details-page">
        <button className="back-project-btn" onClick={() => navigateTo("/mentor/projects")}>
          <ArrowLeft size={17} /> Back to Tasks
        </button>
        {visibleError ? <p role="alert">{visibleError}</p> : null}
        {message ? <p role="status">{message}</p> : null}
        {visibleTask ? (
          <>
            <div className="project-details-header">
              <div><h1>{visibleTask.title}</h1></div>
              <span className="details-status active">{visibleTask.domain}</span>
            </div>
            <section className="details-card">
              <p className="details-description">{visibleTask.description}</p>
              <div className="details-info-grid">
                <div className="details-info-item"><CalendarDays size={18} /><div><span>Deadline</span><strong>{new Date(visibleTask.deadline).toLocaleString()}</strong></div></div>
                <div className="details-info-item"><Users size={18} /><div><span>Submissions</span><strong>{visibleTask.submissions?.length || 0}</strong></div></div>
                <div className="details-info-item"><CalendarDays size={18} /><div><span>Maximum marks</span><strong>{visibleTask.maxMarks}</strong></div></div>
              </div>
            </section>

            <section className="details-card">
              <div className="details-card-heading"><h2>Student Submissions</h2></div>
              {!visibleTask.submissions?.length ? <p>No submissions yet.</p> : null}
              {visibleTask.submissions?.map((submission) => {
                const student = typeof submission.student === "object" ? submission.student : {};
                const studentId = String(student._id || submission.student);
                const draft = getDraft(submission);
                return (
                  <article className="social-project-item" key={studentId}>
                    <h3>{student.fullName || student.email || "Student"}</h3>
                    <p>{student.studentNumber || ""} · {student.branch || ""} · {submission.status}</p>
                    <p>Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "—"}</p>
                    {submission.repoUrl ? <a className="student-project-link" href={submission.repoUrl} target="_blank" rel="noreferrer"><GitBranch size={16} />Repository <ExternalLink size={13} /></a> : null}
                    {submission.liveUrl ? <a className="student-project-link deployment-link" href={submission.liveUrl} target="_blank" rel="noreferrer"><Globe size={16} />Live project <ExternalLink size={13} /></a> : null}
                    <form className="backend-page-form" onSubmit={(event) => reviewSubmission(event, submission)}>
                      <label>
                        Review status
                        <select value={draft.status} onChange={(event) => updateDraft(studentId, "status", event.target.value)}>
                          <option value="GRADED">Graded</option>
                          <option value="REVISION_REQUESTED">Revision requested</option>
                        </select>
                      </label>
                      <label>
                        Marks (out of {visibleTask.maxMarks})
                        <input type="number" min={0} max={visibleTask.maxMarks} value={draft.marksObtained} onChange={(event) => updateDraft(studentId, "marksObtained", event.target.value)} />
                      </label>
                      <label>
                        Mentor feedback
                        <textarea maxLength={1000} value={draft.mentorFeedback} onChange={(event) => updateDraft(studentId, "mentorFeedback", event.target.value)} />
                      </label>
                      <button className="create-project-btn" type="submit" disabled={savingId === studentId}>
                        {savingId === studentId ? "Saving..." : "Save review"}
                      </button>
                    </form>
                  </article>
                );
              })}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default ProjectDetails;
