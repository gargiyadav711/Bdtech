import { useEffect, useState } from "react";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const initialForm = {
  societyName: "Big Data Centre of Excellence",
  domain: "",
  whyJoin: "",
  experience: "",
  githubUrl: "",
  portfolioUrl: "",
  resumeUrl: "",
};

const SocietyApplication = () => {
  const [form, setForm] = useState(initialForm);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/application/my-status")
      .then((data) => {
        if (!active) return;
        const currentApplication = data.application;
        setApplication(currentApplication);
        if (currentApplication) {
          setForm({
            societyName: currentApplication.societyName || initialForm.societyName,
            domain: currentApplication.domain || "",
            whyJoin: currentApplication.whyJoin || "",
            experience: currentApplication.experience || "",
            githubUrl: currentApplication.githubUrl || "",
            portfolioUrl: currentApplication.portfolioUrl || "",
            resumeUrl: currentApplication.resumeUrl || "",
          });
        }
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

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const data = await apiRequest("/api/application", {
        method: "POST",
        body: {
          societyName: form.societyName,
          domain: form.domain,
          whyJoin: form.whyJoin,
          experience: form.experience,
          githubUrl: form.githubUrl,
          portfolioUrl: form.portfolioUrl,
          resumeUrl: form.resumeUrl,
        },
      });
      setApplication(data.application);
      setMessage(data.message || "Application saved successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const isLocked = Boolean(application && application.stage !== "APPLIED");

  if (loading) return <LoadingPage />;

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>Society Application</h1>
            <p>Submit your application to Big Data Centre of Excellence.</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>

        <section className="backend-page-card">
          {application ? (
            <p>Current stage: <strong>{application.stage.replaceAll("_", " ")}</strong></p>
          ) : null}
          {isLocked ? (
            <p>This application can no longer be edited because it has moved past the applied stage.</p>
          ) : (
            <form className="backend-page-form" onSubmit={handleSubmit}>
              <label>
                Society
                <input name="societyName" value={form.societyName} onChange={handleChange} required minLength={2} />
              </label>
              <label>
                Domain
                <input name="domain" value={form.domain} onChange={handleChange} required minLength={2} />
              </label>
              <label>
                Why do you want to join?
                <textarea name="whyJoin" value={form.whyJoin} onChange={handleChange} required minLength={20} maxLength={1000} />
              </label>
              <label>
                Relevant experience
                <textarea name="experience" value={form.experience} onChange={handleChange} maxLength={1000} />
              </label>
              <label>
                GitHub URL
                <input name="githubUrl" type="url" value={form.githubUrl} onChange={handleChange} />
              </label>
              <label>
                Portfolio URL
                <input name="portfolioUrl" type="url" value={form.portfolioUrl} onChange={handleChange} />
              </label>
              <label>
                Resume URL
                <input name="resumeUrl" type="url" value={form.resumeUrl} onChange={handleChange} />
              </label>
              <button className="backend-page-button" type="submit" disabled={saving}>
                {saving ? "Saving..." : application ? "Update application" : "Submit application"}
              </button>
            </form>
          )}
          {error ? <p className="backend-page-message backend-page-error" role="alert">{error}</p> : null}
          {message ? <p className="backend-page-message" role="status">{message}</p> : null}
        </section>
      </div>
    </main>
  );
};

export default SocietyApplication;
