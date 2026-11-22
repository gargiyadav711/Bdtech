import { useState } from "react";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const StudentSettings = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const data = await apiRequest("/api/profile/change-password", {
        method: "PUT",
        body: form,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage(data.message || "Password updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>Student Settings</h1>
            <p>Update your account password.</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>
        <section className="backend-page-card">
          <form className="backend-page-form" onSubmit={changePassword}>
            <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={handleChange} required /></label>
            <label>New password<input name="newPassword" type="password" autoComplete="new-password" value={form.newPassword} onChange={handleChange} minLength={8} required /></label>
            <label>Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} minLength={8} required /></label>
            <button className="backend-page-button" type="submit" disabled={saving}>{saving ? "Updating..." : "Change password"}</button>
          </form>
          {error ? <p className="backend-page-message backend-page-error" role="alert">{error}</p> : null}
          {message ? <p className="backend-page-message" role="status">{message}</p> : null}
        </section>
      </div>
    </main>
  );
};

export default StudentSettings;
