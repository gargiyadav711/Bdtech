import { useState } from "react";
import {FolderKanban,Plus,GitBranch,ExternalLink,Clock,CheckCircle2,AlertCircle,X,Code2,} from "lucide-react";
import "./StudentProjects.css";
function StudentProjects() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    github: "",
    liveLink: "",
  });

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Smart Campus Navigator",
      description:
        "A web application to help students navigate campus and discover important locations.",
      techStack: ["React", "JavaScript", "CSS"],
      github: "https://github.com",
      liveLink: "https://example.com",
      date: "18 Nov 2026",
      status: "Approved",
      feedback: "Great UI and project structure. Keep improving accessibility.",
    },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      techStack: formData.techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      github: formData.github,
      liveLink: formData.liveLink,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
      feedback: "",
    };

    setProjects((prev) => [newProject, ...prev]);

    setFormData({
      title: "",
      description: "",
      techStack: "",
      github: "",
      liveLink: "",
    });

    setShowForm(false);
  };

  const getStatusClass = (status) => {
    if (status === "Approved") return "sp-status-approved";
    if (status === "Revision Required") return "sp-status-revision";
    return "sp-status-pending";
  };

  const pendingCount = projects.filter(
    (project) => project.status === "Pending"
  ).length;

  const approvedCount = projects.filter(
    (project) => project.status === "Approved"
  ).length;

  const revisionCount = projects.filter(
    (project) => project.status === "Revision Required"
  ).length;

  return (
    <div className="student-projects-page">
      <div className="sp-page-header">
        <div>
          <h1>My Projects</h1>
        </div>
        <button
          type="button"
          className="sp-primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          Submit Project
        </button>
      </div>

      <div className="sp-stats-grid">
        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-purple">
            <FolderKanban size={21} />
          </div>
          <div>
            <span>Total Projects</span>
            <h2>{projects.length}</h2>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-purple">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending Review</span>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-purple">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Approved</span>
            <h2>{approvedCount}</h2>
          </div>
        </div>

        <div className="sp-stat-card">
          <div className="sp-stat-icon sp-">
            <AlertCircle size={21} />
          </div>
          <div>
            <span>Revision Required</span>
            <h2>{revisionCount}</h2>
          </div>
        </div>
      </div>

      {showForm ? (
        <div className="sp-overlay-backdrop">
          <div className="sp-elegant-form-card">
            <button
              type="button"
              className="sp-elegant-close-btn"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              <X size={24} />
            </button>

            <div className="sp-elegant-header">
              <h2 className="sp-elegant-title">
                Submit Your Project Here !
                <br />
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="sp-elegant-form">
              <div className="sp-elegant-group">
                <input
                  type="text"
                  name="title"
                  placeholder="Project Title *"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sp-elegant-group">
                <textarea
                  name="description"
                  placeholder="Description * (Describe your project, features, and what you built...)"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="sp-elegant-group">
                <input
                  type="text"
                  name="techStack"
                  placeholder="Technologies Used * (e.g., React, Node.js, MongoDB)"
                  value={formData.techStack}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sp-elegant-row">
                <div className="sp-elegant-group">
                  <input
                    type="text"
                    name="github"
                    placeholder="GitHub Repository"
                    value={formData.github}
                    onChange={handleChange}
                  />
                </div>

                <div className="sp-elegant-group">
                  <input
                    type="text"
                    name="liveLink"
                    placeholder="Live Project Link"
                    value={formData.liveLink}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="sp-elegant-submit-btn">
                CONTINUE
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Project List */}
      <div className="sp-projects-section">
        <div className="sp-projects-section-header">
          <div>
            <h2>My Projects</h2>
            <p>Track your submissions and mentor feedback.</p>
          </div>
        </div>

        <div className="sp-projects-grid">
          {projects.map((project) => (
            <div className="sp-project-card" key={project.id}>
              <div className="sp-project-card-top">
                <div className="sp-project-icon">
                  <Code2 size={22} />
                </div>

                <span
                  className={`sp-project-status ${getStatusClass(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>

              <h3>{project.title}</h3>

              <p className="sp-project-description">{project.description}</p>

              <div className="sp-tech-stack">
                {project.techStack.map((tech, index) => (
                  <span key={index}>{tech}</span>
                ))}
              </div>

              <div className="sp-project-links">
                {project.github ? (
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <GitBranch size={15} />
                    GitHub
                  </a>
                ) : null}

                {project.liveLink ? (
                  <a href={project.liveLink} target="_blank" rel="noreferrer">
                    <ExternalLink size={15} />
                    Live Demo
                  </a>
                ) : null}
              </div>

              <div className="sp-project-date">Submitted on {project.date}</div>

              {project.feedback ? (
                <div
                  className={`sp-feedback ${
                    project.status === "Revision Required"
                      ? "sp-feedback-revision"
                      : ""
                  }`}
                >
                  <strong>Mentor Feedback</strong>
                  <p>{project.feedback}</p>
                </div>
              ) : (
                <div className="sp-no-feedback">
                  <Clock size={15} />
                  Awaiting mentor review
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentProjects;