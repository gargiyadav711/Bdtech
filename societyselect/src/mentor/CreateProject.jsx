import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import MentorSidebar from "../Components/MentorSidebar";
import LoadingPage from "../Components/LoadingPage.jsx";
import { navigateTo } from "../utils/navigation";
import { apiRequest } from "../utils/api";
import "./CreateProject.css";

const STEPS = [
  { id: 1, title: "Project Information" },
  { id: 2, title: "Assign Students" },
  { id: 3, title: "Add Project Tasks" },
  { id: 4, title: "Review & Create" },
];

const CATEGORIES = [
  "Web Development",
  "Mobile App",
  "AI / Machine Learning",
  "Data Science / Big Data",
  "Cloud / DevOps",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High"];

let taskCounter = 0;
const newTask = (studentId = "") => {
  taskCounter += 1;
  return {
    key: `task-${Date.now()}-${taskCounter}`,
    title: "",
    description: "",
    studentId,
    priority: "Medium",
    deadline: "",
    hours: "",
  };
};

const EMPTY_PROJECT = {
  title: "",
  description: "",
  category: "",
  technologies: [],
  type: "INDIVIDUAL",
  teamName: "",
  startDate: "",
  deadline: "",
};

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Returns a list of problems for one step (empty list = step is valid)
const validateStep = (step, project, selectedIds, tasks) => {
  const issues = [];

  if (step === 1) {
    const title = project.title.trim();
    if (title.length < 3) issues.push("Project title must be at least 3 characters.");
    if (title.length > 150) issues.push("Project title cannot exceed 150 characters.");
    if (project.description.trim().length < 10) {
      issues.push("Add a description and objectives (at least 10 characters).");
    }
    if (!project.category) issues.push("Select a project category.");
    if (project.technologies.length === 0) issues.push("Add at least one technology.");
  }

  if (step === 2) {
    if (project.type === "GROUP") {
      if (project.teamName.trim().length < 2) {
        issues.push("Enter a team name for the group project.");
      }
      if (selectedIds.length < 2) {
        issues.push("A group project needs at least 2 students.");
      }
    } else if (selectedIds.length < 1) {
      issues.push("Select at least one student.");
    }
    if (!project.startDate) issues.push("Set the project start date.");
    if (!project.deadline) issues.push("Set the overall project deadline.");
    if (project.startDate && project.deadline && project.deadline < project.startDate) {
      issues.push("The project deadline cannot be before the start date.");
    }
  }

  if (step === 3) {
    if (tasks.length === 0) issues.push("Add at least one task.");
    tasks.forEach((t, i) => {
      const n = i + 1;
      if (t.title.trim().length < 3) {
        issues.push(`Task ${n}: title must be at least 3 characters.`);
      }
      if (t.description.trim().length < 10) {
        issues.push(`Task ${n}: description must be at least 10 characters.`);
      }
      if (!t.studentId) issues.push(`Task ${n}: assign it to a student.`);
      if (!t.deadline) {
        issues.push(`Task ${n}: set a deadline.`);
      } else if (
        (project.startDate && t.deadline < project.startDate) ||
        (project.deadline && t.deadline > project.deadline)
      ) {
        issues.push(
          `Task ${n}: deadline must be between the project start date and deadline.`
        );
      }
      const hours = Number(t.hours);
      if (!Number.isInteger(hours) || hours < 1 || hours > 500) {
        issues.push(`Task ${n}: estimated hours must be a whole number from 1 to 500.`);
      }
    });
  }

  return issues;
};

// The backend currently has no project model, only POST /api/mentor/tasks
// (title, description, deadline, maxMarks). Project details, assignee,
// priority and hours are written into the description so nothing is lost.
// TODO(backend): replace with POST /api/mentor/projects once it exists.
const buildTaskPayload = (project, task, student) => {
  const teamLabel =
    project.type === "GROUP"
      ? `Group project${project.teamName.trim() ? ` Â· ${project.teamName.trim()}` : ""}`
      : "Individual project";

  const header = [
    `Project: ${project.title.trim()} (${teamLabel})`,
    `Assigned to: ${student?.fullName || "Unassigned"}${
      student?.studentNumber ? ` (${student.studentNumber})` : ""
    }`,
    `Priority: ${task.priority} Â· Estimated: ${task.hours} hours`,
    `Project deadline: ${formatDate(project.deadline)}`,
  ].join("\n");

  return {
    title: task.title.trim(),
    description: `${header}\n\n${task.description.trim()}`,
    deadline: new Date(`${task.deadline}T23:59:00`).toISOString(),
    maxMarks: 100,
  };
};

function CreateProject() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState([]);

  const [project, setProject] = useState(EMPTY_PROJECT);
  const [techInput, setTechInput] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [tasks, setTasks] = useState(() => [newTask()]);

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");
  const [studentQuery, setStudentQuery] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [done, setDone] = useState(false);
  const savedKeysRef = useRef(new Set());

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const data = await apiRequest("/api/mentor/students");
      setStudents(data.students || []);
    } catch (err) {
      setStudentsError(err.message);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const studentById = useMemo(
    () => new Map(students.map((s) => [s._id, s])),
    [students]
  );

  const selectedStudents = selectedIds
    .map((id) => studentById.get(id))
    .filter(Boolean);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.fullName, s.email, s.studentNumber, s.rollNo].some((v) =>
        (v || "").toLowerCase().includes(q)
      )
    );
  }, [students, studentQuery]);

  const totalHours = tasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);

  const updateProject = (field, value) =>
    setProject((p) => ({ ...p, [field]: value }));

  /* ---------- technologies ---------- */
  const addTech = () => {
    const value = techInput.trim().replace(/,$/, "");
    if (!value) return;
    setProject((p) =>
      p.technologies.some((t) => t.toLowerCase() === value.toLowerCase())
        ? p
        : { ...p, technologies: [...p.technologies, value] }
    );
    setTechInput("");
  };

  const onTechKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTech();
    }
  };

  const removeTech = (tech) =>
    setProject((p) => ({
      ...p,
      technologies: p.technologies.filter((t) => t !== tech),
    }));

  /* ---------- students ---------- */
  const unassignTasksOf = (ids) =>
    setTasks((list) =>
      list.map((t) => (ids.includes(t.studentId) ? { ...t, studentId: "" } : t))
    );

  const toggleStudent = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((ids) => ids.filter((x) => x !== id));
      unassignTasksOf([id]);
    } else {
      setSelectedIds((ids) => [...ids, id]);
    }
  };

  const allVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(s._id));

  const toggleAllVisible = () => {
    const visibleIds = filteredStudents.map((s) => s._id);
    if (allVisibleSelected) {
      setSelectedIds((ids) => ids.filter((id) => !visibleIds.includes(id)));
      unassignTasksOf(visibleIds);
    } else {
      setSelectedIds((ids) => [...new Set([...ids, ...visibleIds])]);
    }
  };

  /* ---------- tasks ---------- */
  const updateTask = (key, field, value) =>
    setTasks((list) =>
      list.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );

  const addTask = () =>
    setTasks((list) => [
      ...list,
      newTask(selectedIds.length === 1 ? selectedIds[0] : ""),
    ]);

  const removeTask = (key) =>
    setTasks((list) => (list.length > 1 ? list.filter((t) => t.key !== key) : list));

  /* ---------- navigation ---------- */
  const goNext = () => {
    const issues = validateStep(step, project, selectedIds, tasks);
    if (issues.length > 0) {
      setErrors(issues);
      return;
    }
    setErrors([]);

    // With a single student, pre-assign any unassigned tasks to them
    if (step === 2 && selectedIds.length === 1) {
      setTasks((list) =>
        list.map((t) => (t.studentId ? t : { ...t, studentId: selectedIds[0] }))
      );
    }

    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const jumpTo = (target) => {
    if (target < step) {
      setErrors([]);
      setStep(target);
    }
  };

  /* ---------- submit ---------- */
  const handleCreate = async () => {
    const issues = [1, 2, 3].flatMap((s) =>
      validateStep(s, project, selectedIds, tasks)
    );
    if (issues.length > 0) {
      setErrors(issues);
      return;
    }

    setErrors([]);
    setSubmitError("");
    setSubmitting(true);

    try {
      // Tasks already saved on an earlier attempt are skipped, so retrying
      // after a failure never creates duplicates.
      for (const task of tasks) {
        if (savedKeysRef.current.has(task.key)) continue;
        await apiRequest("/api/mentor/tasks", {
          method: "POST",
          body: JSON.stringify(
            buildTaskPayload(project, task, studentById.get(task.studentId))
          ),
        });
        savedKeysRef.current.add(task.key);
        setSavedCount(savedKeysRef.current.size);
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        `${savedKeysRef.current.size} of ${tasks.length} tasks were saved. ${err.message} ` +
          "Press Create Project again to continue. Tasks already saved will not be sent twice."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    savedKeysRef.current = new Set();
    setProject(EMPTY_PROJECT);
    setTechInput("");
    setSelectedIds([]);
    setTasks([newTask()]);
    setStudentQuery("");
    setSavedCount(0);
    setSubmitError("");
    setErrors([]);
    setDone(false);
    setStep(1);
  };

  /* ---------- render ---------- */
  if (studentsLoading) return <LoadingPage />;

  return (
    <div className="cp-layout">
      <MentorSidebar />

      <main className="cp-page">
        <button
          type="button"
          className="cp-back"
          onClick={() => navigateTo("/mentor/projects")}
        >
          <FiArrowLeft /> Back to Projects
        </button>

        <header className="cp-header">
          <h1>Create New Project</h1>
          <p>Set up the project, assign students and add tasks in one go.</p>
        </header>

        {done ? (
          <section className="cp-card cp-success">
            <div className="cp-success-icon">
              <FiCheckCircle />
            </div>
            <h2>Project tasks created</h2>
            <p>
              {savedCount} {savedCount === 1 ? "task" : "tasks"} for{" "}
              <strong>{project.title.trim()}</strong> {savedCount === 1 ? "was" : "were"} saved
              and assigned.
            </p>
            <div className="cp-success-actions">
              <button
                type="button"
                className="cp-btn primary"
                onClick={() => navigateTo("/mentor/projects")}
              >
                Back to Projects
              </button>
              <button type="button" className="cp-btn ghost" onClick={resetAll}>
                Create another project
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Stepper */}
            <ol className="cp-stepper">
              {STEPS.map((s) => {
                const state =
                  s.id === step ? "current" : s.id < step ? "done" : "upcoming";
                return (
                  <li key={s.id} className={`cp-step ${state}`}>
                    <button
                      type="button"
                      onClick={() => jumpTo(s.id)}
                      disabled={s.id >= step}
                      aria-current={s.id === step ? "step" : undefined}
                    >
                      <span className="cp-step-num">
                        {state === "done" ? <FiCheck /> : String(s.id).padStart(2, "0")}
                      </span>
                      <span className="cp-step-title">{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {errors.length > 0 && (
              <div className="cp-banner error" role="alert">
                <FiAlertCircle />
                <div>
                  <strong>Please fix the following:</strong>
                  <ul>
                    {errors.map((msg) => (
                      <li key={msg}>{msg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {submitError && (
              <div className="cp-banner error" role="alert">
                <FiAlertCircle />
                <div>{submitError}</div>
              </div>
            )}

            <section className="cp-card">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="cp-step-body">
                  <div className="cp-section-head">
                    <h2>Project Information</h2>
                    <p>Tell students what this project is about.</p>
                  </div>

                  <div className="cp-field">
                    <label htmlFor="cp-title">Project title</label>
                    <input
                      id="cp-title"
                      type="text"
                      maxLength={150}
                      placeholder="e.g. College Event Management Website"
                      value={project.title}
                      onChange={(e) => updateProject("title", e.target.value)}
                    />
                  </div>

                  <div className="cp-field">
                    <label htmlFor="cp-description">Description and objectives</label>
                    <textarea
                      id="cp-description"
                      rows={5}
                      maxLength={1000}
                      placeholder="What should students build, and what should they learn?"
                      value={project.description}
                      onChange={(e) => updateProject("description", e.target.value)}
                    />
                  </div>

                  <div className="cp-grid-2">
                    <div className="cp-field">
                      <label htmlFor="cp-category">Category</label>
                      <select
                        id="cp-category"
                        value={project.category}
                        onChange={(e) => updateProject("category", e.target.value)}
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="cp-field">
                      <label htmlFor="cp-tech">Technologies</label>
                      <div className="cp-tag-input">
                        <input
                          id="cp-tech"
                          type="text"
                          placeholder="Type a technology and press Enter"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={onTechKeyDown}
                          onBlur={addTech}
                        />
                        <button type="button" onClick={addTech} aria-label="Add technology">
                          <FiPlus />
                        </button>
                      </div>
                      {project.technologies.length > 0 && (
                        <div className="cp-chip-row">
                          {project.technologies.map((tech) => (
                            <span className="cp-chip removable" key={tech}>
                              {tech}
                              <button
                                type="button"
                                onClick={() => removeTech(tech)}
                                aria-label={`Remove ${tech}`}
                              >
                                <FiX />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="cp-field">
                    <span className="cp-label">Project type</span>
                    <div className="cp-type-options">
                      {[
                        { value: "INDIVIDUAL", label: "Individual", hint: "Each student works on their own tasks" },
                        { value: "GROUP", label: "Group", hint: "Students work together as a team" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`cp-type-card ${project.type === opt.value ? "active" : ""}`}
                          onClick={() => updateProject("type", opt.value)}
                          aria-pressed={project.type === opt.value}
                        >
                          <strong>{opt.label}</strong>
                          <span>{opt.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="cp-step-body">
                  <div className="cp-section-head">
                    <h2>Assign Students</h2>
                    <p>
                      {project.type === "GROUP"
                        ? "Name the team and choose its members."
                        : "Choose the students who will work on this project."}
                    </p>
                  </div>

                  {project.type === "GROUP" && (
                    <div className="cp-field">
                      <label htmlFor="cp-team">Team name</label>
                      <input
                        id="cp-team"
                        type="text"
                        maxLength={60}
                        placeholder="e.g. Team Alpha"
                        value={project.teamName}
                        onChange={(e) => updateProject("teamName", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="cp-grid-2">
                    <div className="cp-field">
                      <label htmlFor="cp-start">Project start date</label>
                      <input
                        id="cp-start"
                        type="date"
                        value={project.startDate}
                        onChange={(e) => updateProject("startDate", e.target.value)}
                      />
                    </div>
                    <div className="cp-field">
                      <label htmlFor="cp-deadline">Overall project deadline</label>
                      <input
                        id="cp-deadline"
                        type="date"
                        min={project.startDate || undefined}
                        value={project.deadline}
                        onChange={(e) => updateProject("deadline", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="cp-students-bar">
                    <label className="cp-search">
                      <FiSearch />
                      <input
                        type="text"
                        placeholder="Search by name, email or student number"
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="cp-btn ghost small"
                      onClick={toggleAllVisible}
                      disabled={filteredStudents.length === 0}
                    >
                      {allVisibleSelected ? "Clear selection" : "Select all"}
                    </button>
                    <span className="cp-count">{selectedIds.length} selected</span>
                  </div>

                  {studentsError && (
                    <div className="cp-banner error" role="alert">
                      <FiAlertCircle />
                      <div>
                        {studentsError}{" "}
                        <button type="button" className="cp-link-btn" onClick={loadStudents}>
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {!studentsError && filteredStudents.length === 0 && (
                    <p className="cp-muted">No students found in your domain.</p>
                  )}

                  <div className="cp-student-list">
                    {filteredStudents.map((s) => {
                      const checked = selectedIds.includes(s._id);
                      return (
                        <label
                          key={s._id}
                          className={`cp-student ${checked ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudent(s._id)}
                          />
                          <span className="cp-avatar">{initials(s.fullName)}</span>
                          <span className="cp-student-info">
                            <strong>{s.fullName}</strong>
                            <span>
                              {[s.studentNumber, s.branch, s.year].filter(Boolean).join(" Â· ")}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="cp-step-body">
                  <div className="cp-section-head">
                    <h2>Add Project Tasks</h2>
                    <p>Break the project into tasks and give each one to a student.</p>
                  </div>

                  <div className="cp-task-list">
                    {tasks.map((task, index) => (
                      <div className="cp-task" key={task.key}>
                        <div className="cp-task-head">
                          <h3>Task {index + 1}</h3>
                          <button
                            type="button"
                            className="cp-icon-btn"
                            onClick={() => removeTask(task.key)}
                            disabled={tasks.length === 1}
                            aria-label={`Remove task ${index + 1}`}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="cp-field">
                          <label htmlFor={`${task.key}-title`}>Task title</label>
                          <input
                            id={`${task.key}-title`}
                            type="text"
                            maxLength={150}
                            placeholder="e.g. Homepage UI Design"
                            value={task.title}
                            onChange={(e) => updateTask(task.key, "title", e.target.value)}
                          />
                        </div>

                        <div className="cp-field">
                          <label htmlFor={`${task.key}-desc`}>Task description</label>
                          <textarea
                            id={`${task.key}-desc`}
                            rows={3}
                            maxLength={1500}
                            placeholder="What exactly should be delivered?"
                            value={task.description}
                            onChange={(e) => updateTask(task.key, "description", e.target.value)}
                          />
                        </div>

                        <div className="cp-grid-4">
                          <div className="cp-field">
                            <label htmlFor={`${task.key}-student`}>Assign to</label>
                            <select
                              id={`${task.key}-student`}
                              value={task.studentId}
                              onChange={(e) => updateTask(task.key, "studentId", e.target.value)}
                            >
                              <option value="">Select student</option>
                              {selectedStudents.map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.fullName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="cp-field">
                            <span className="cp-label">Priority</span>
                            <div className="cp-priority">
                              {PRIORITIES.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  className={`cp-priority-btn ${p.toLowerCase()} ${
                                    task.priority === p ? "active" : ""
                                  }`}
                                  onClick={() => updateTask(task.key, "priority", p)}
                                  aria-pressed={task.priority === p}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="cp-field">
                            <label htmlFor={`${task.key}-deadline`}>Task deadline</label>
                            <input
                              id={`${task.key}-deadline`}
                              type="date"
                              min={project.startDate || undefined}
                              max={project.deadline || undefined}
                              value={task.deadline}
                              onChange={(e) => updateTask(task.key, "deadline", e.target.value)}
                            />
                          </div>

                          <div className="cp-field">
                            <label htmlFor={`${task.key}-hours`}>Estimated hours</label>
                            <input
                              id={`${task.key}-hours`}
                              type="number"
                              min="1"
                              max="500"
                              step="1"
                              placeholder="e.g. 8"
                              value={task.hours}
                              onChange={(e) => updateTask(task.key, "hours", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="cp-btn ghost add-task" onClick={addTask}>
                    <FiPlus /> Add another task
                  </button>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="cp-step-body">
                  <div className="cp-section-head">
                    <h2>Review &amp; Create</h2>
                    <p>Check everything before you create the project.</p>
                  </div>

                  <div className="cp-review-block">
                    <div className="cp-review-head">
                      <h3>Project information</h3>
                      <button type="button" className="cp-link-btn" onClick={() => jumpTo(1)}>
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <dl className="cp-review-list">
                      <div>
                        <dt>Title</dt>
                        <dd>{project.title.trim()}</dd>
                      </div>
                      <div>
                        <dt>Type</dt>
                        <dd>{project.type === "GROUP" ? "Group" : "Individual"}</dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{project.category}</dd>
                      </div>
                      <div>
                        <dt>Technologies</dt>
                        <dd className="cp-chip-row">
                          {project.technologies.map((t) => (
                            <span className="cp-chip" key={t}>
                              {t}
                            </span>
                          ))}
                        </dd>
                      </div>
                      <div className="cp-wide">
                        <dt>Description</dt>
                        <dd>{project.description.trim()}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="cp-review-block">
                    <div className="cp-review-head">
                      <h3>Students and schedule</h3>
                      <button type="button" className="cp-link-btn" onClick={() => jumpTo(2)}>
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <dl className="cp-review-list">
                      {project.type === "GROUP" && (
                        <div>
                          <dt>Team</dt>
                          <dd>{project.teamName.trim()}</dd>
                        </div>
                      )}
                      <div>
                        <dt>Start date</dt>
                        <dd>{formatDate(project.startDate)}</dd>
                      </div>
                      <div>
                        <dt>Deadline</dt>
                        <dd>{formatDate(project.deadline)}</dd>
                      </div>
                      <div className="cp-wide">
                        <dt>Students ({selectedStudents.length})</dt>
                        <dd className="cp-chip-row">
                          {selectedStudents.map((s) => (
                            <span className="cp-chip" key={s._id}>
                              {s.fullName}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="cp-review-block">
                    <div className="cp-review-head">
                      <h3>
                        Tasks ({tasks.length}) Â· {totalHours} estimated hours
                      </h3>
                      <button type="button" className="cp-link-btn" onClick={() => jumpTo(3)}>
                        <FiEdit2 /> Edit
                      </button>
                    </div>
                    <div className="cp-table-wrap">
                      <table className="cp-table">
                        <thead>
                          <tr>
                            <th>Task</th>
                            <th>Assigned to</th>
                            <th>Priority</th>
                            <th>Deadline</th>
                            <th>Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((t) => (
                            <tr key={t.key}>
                              <td>{t.title.trim()}</td>
                              <td>{studentById.get(t.studentId)?.fullName || "-"}</td>
                              <td>
                                <span className={`cp-pill ${t.priority.toLowerCase()}`}>
                                  {t.priority}
                                </span>
                              </td>
                              <td>{formatDate(t.deadline)}</td>
                              <td>{t.hours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Actions */}
            <div className="cp-actions">
              {step === 1 ? (
                <button
                  type="button"
                  className="cp-btn ghost"
                  onClick={() => navigateTo("/mentor/projects")}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="cp-btn ghost"
                  onClick={goBack}
                  disabled={submitting}
                >
                  <FiArrowLeft /> Back
                </button>
              )}

              {step < 4 ? (
                <button type="button" className="cp-btn primary" onClick={goNext}>
                  Next <FiArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  className="cp-btn primary"
                  onClick={handleCreate}
                  disabled={submitting}
                >
                  {submitting
                    ? `Creating... (${savedCount}/${tasks.length})`
                    : "Create Project"}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default CreateProject;
