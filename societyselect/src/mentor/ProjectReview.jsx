import { useEffect, useState } from "react";
import {
  CalendarDays,
  Eye,
  FolderKanban,
  Plus,
  Users,
} from "lucide-react";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import { navigateTo } from "../utils/navigation";
import "../pages/student/StudentApiPages.css";
import "./ProjectReview.css";

const emptyForm = {
  title: "",
  description: "",
  deadline: "",
  maxMarks: "100",
};

function ProjectReview() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/mentor/tasks")
      .then((data) => {
        if (active) setTasks(data.tasks || []);
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

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createTask = async (event) => {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      const data = await apiRequest("/api/mentor/tasks", {
        method: "POST",
        body: {
          ...form,
          deadline: new Date(form.deadline).toISOString(),
          maxMarks: Number(form.maxMarks),
        },
      });
      setTasks((current) => [data.task, ...current]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="project-review-layout">
      <MentorSidebar />
      <main className="project-review-page">
        <div className="project-page-header">
          <div><h1>Task Reviews</h1></div>
          <button className="create-project-btn" onClick={() => setShowForm((open) => !open)}>
            <Plus size={19} />
            {showForm ? "Cancel" : "Create Task"}
          </button>
        </div>

        {error ? <p role="alert">{error}</p> : null}
        {showForm ? (
          <section className="project-list-section">
            <h2>Create a domain task</h2>
            <form className="backend-page-form" onSubmit={createTask}>
              <label>Title<input name="title" value={form.title} onChange={updateForm} required minLength={3} maxLength={150} /></label>
              <label>Description<textarea name="description" value={form.description} onChange={updateForm} required minLength={10} maxLength={2000} /></label>
              <label>Deadline<input name="deadline" type="datetime-local" value={form.deadline} onChange={updateForm} required /></label>
              <label>Maximum marks<input name="maxMarks" type="number" min={1} max={1000} value={form.maxMarks} onChange={updateForm} required /></label>
              <button className="create-project-btn" type="submit" disabled={creating}>{creating ? "Creating..." : "Create task"}</button>
            </form>
          </section>
        ) : null}

        <section className="project-list-section">
          <div className="project-list-heading"><h2>Tasks in your domain</h2></div>
          {!tasks.length ? <p>No tasks have been created yet.</p> : null}
          {tasks.length ? (
            <div className="project-table-wrapper">
              <table className="project-table">
                <thead>
                  <tr><th>Task</th><th>Submissions</th><th>Deadline</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const submissions = task.submissions || [];
                    const hasPending = submissions.some((submission) => submission.status === "SUBMITTED");
                    const status = hasPending ? "Pending review" : submissions.length ? "Reviewed" : "Active";
                    return (
                      <tr key={task._id}>
                        <td>
                          <div className="project-name-cell">
                            <div className="project-row-icon"><FolderKanban size={19} /></div>
                            <div><strong>{task.title}</strong><span>{task.domain} · {task.maxMarks} marks</span></div>
                          </div>
                        </td>
                        <td><div className="project-student-cell"><Users size={16} />{submissions.length}</div></td>
                        <td><div className="project-deadline"><CalendarDays size={15} />{new Date(task.deadline).toLocaleDateString()}</div></td>
                        <td><span className="project-status submitted">{status}</span></td>
                        <td>
                          <button className="project-review-action" onClick={() => navigateTo(`/mentor/project-review/${task._id}`)}>
                            <Eye size={17} />Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default ProjectReview;
