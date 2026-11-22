import { useEffect, useState } from "react";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const MyTasks = () => {
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/tasks/my-tasks")
      .then((response) => {
        if (active) setData(response);
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

  const getDraft = (task) => drafts[task._id] || {
    repoUrl: task.mySubmission?.repoUrl || "",
    liveUrl: task.mySubmission?.liveUrl || "",
    notes: task.mySubmission?.notes || "",
  };

  const updateDraft = (taskId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [taskId]: { ...getDraft(data.tasks.find((task) => task._id === taskId)), ...current[taskId], [field]: value },
    }));
  };

  const submitTask = async (event, task) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingId(task._id);

    try {
      const response = await apiRequest(`/api/tasks/${task._id}/submit`, {
        method: "POST",
        body: getDraft(task),
      });
      setData((current) => ({
        ...current,
        tasks: current.tasks.map((item) =>
          item._id === task._id ? { ...item, mySubmission: response.submission } : item
        ),
      }));
      setMessage(response.message || "Task submitted successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>My Tasks</h1>
            <p>{data ? `${data.completedCount} of ${data.totalTasks} submitted · ${data.domain}` : "Tasks assigned to your domain."}</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>

        {error ? <p className="backend-page-error" role="alert">{error}</p> : null}
        {message ? <p className="backend-page-message" role="status">{message}</p> : null}
        {data?.tasks?.length === 0 ? <p>No tasks are available yet.</p> : null}
        <ul className="backend-page-list">
          {data?.tasks?.map((task) => {
            const draft = getDraft(task);
            return (
              <li key={task._id}>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
                <dl className="backend-page-meta">
                  <div><dt>Deadline</dt><dd>{new Date(task.deadline).toLocaleDateString()}</dd></div>
                  <div><dt>Maximum marks</dt><dd>{task.maxMarks}</dd></div>
                  <div><dt>Submission status</dt><dd>{task.mySubmission?.status || "Not submitted"}</dd></div>
                  <div><dt>Score</dt><dd>{task.mySubmission?.marksObtained ?? "Not graded"}</dd></div>
                </dl>
                {task.mySubmission?.mentorFeedback ? <p>Mentor feedback: {task.mySubmission.mentorFeedback}</p> : null}
                <form className="backend-page-form" onSubmit={(event) => submitTask(event, task)}>
                  <label>
                    GitHub repository URL
                    <input type="url" required value={draft.repoUrl} onChange={(event) => updateDraft(task._id, "repoUrl", event.target.value)} />
                  </label>
                  <label>
                    Live project URL (optional)
                    <input type="url" value={draft.liveUrl} onChange={(event) => updateDraft(task._id, "liveUrl", event.target.value)} />
                  </label>
                  <label>
                    Notes
                    <textarea maxLength={500} value={draft.notes} onChange={(event) => updateDraft(task._id, "notes", event.target.value)} />
                  </label>
                  <button className="backend-page-button" type="submit" disabled={savingId === task._id}>
                    {savingId === task._id ? "Submitting..." : task.mySubmission ? "Update submission" : "Submit task"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
};

export default MyTasks;