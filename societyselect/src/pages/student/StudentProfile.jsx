import { useEffect, useState } from "react";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [skillsText, setSkillsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/profile/me")
      .then((data) => {
        if (!active) return;
        setProfile(data.user);
        setSkillsText((data.user.skills || []).join(", "));
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

  const updateField = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const body = {
      fullName: profile.fullName,
      branch: profile.branch || "",
      section: profile.section || "",
      rollNo: profile.rollNo || "",
      year: profile.year || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      skills: skillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
      githubUsername: profile.githubUsername || "",
      githubUrl: profile.githubUrl || "",
    };
    if (profile.domain) body.domain = profile.domain;

    try {
      const data = await apiRequest("/api/profile/me", {
        method: "PUT",
        body,
      });
      setProfile(data.user);
      setSkillsText((data.user.skills || []).join(", "));
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...savedUser, ...data.user }));
      setMessage(data.message || "Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>Student Profile</h1>
            <p>Keep your profile information up to date.</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>

        {profile ? (
          <section className="backend-page-card">
            <form className="backend-page-form" onSubmit={saveProfile}>
              <label>Full name<input name="fullName" value={profile.fullName || ""} onChange={updateField} required minLength={2} /></label>
              <label>Email<input value={profile.email || ""} readOnly /></label>
              <label>Student number<input value={profile.studentNumber || ""} readOnly /></label>
              <label>Domain<input name="domain" value={profile.domain || ""} onChange={updateField} minLength={2} /></label>
              <label>Branch<input name="branch" value={profile.branch || ""} onChange={updateField} /></label>
              <label>Section<input name="section" value={profile.section || ""} onChange={updateField} maxLength={10} /></label>
              <label>Roll number<input name="rollNo" value={profile.rollNo || ""} onChange={updateField} maxLength={30} /></label>
              <label>Year<input name="year" value={profile.year || ""} onChange={updateField} /></label>
              <label>Phone<input name="phone" inputMode="numeric" pattern="[0-9]{10}" value={profile.phone || ""} onChange={updateField} /></label>
              <label>GitHub username<input name="githubUsername" value={profile.githubUsername || ""} onChange={updateField} /></label>
              <label>GitHub URL<input name="githubUrl" type="url" value={profile.githubUrl || ""} onChange={updateField} /></label>
              <label>Skills (comma separated)<input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} /></label>
              <label>Bio<textarea name="bio" value={profile.bio || ""} onChange={updateField} maxLength={300} /></label>
              <button className="backend-page-button" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
            </form>
          </section>
        ) : null}
        {error ? <p className="backend-page-error" role="alert">{error}</p> : null}
        {message ? <p className="backend-page-message" role="status">{message}</p> : null}
      </div>
    </main>
  );
};

export default StudentProfile;
