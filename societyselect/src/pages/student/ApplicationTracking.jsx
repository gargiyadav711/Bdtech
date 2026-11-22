import { useEffect, useState } from "react";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const ApplicationTracking = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/application/my-status")
      .then((data) => {
        if (active) setStatus(data);
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

  if (loading) return <LoadingPage />;

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>Application Tracking</h1>
            <p>Check your latest recruitment application status.</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>

        {error ? <p className="backend-page-error" role="alert">{error}</p> : null}
        {!error && status ? (
          <section className="backend-page-card">
            {status.hasApplied ? (
              <>
                <h2>{status.application?.societyName || "Society application"}</h2>
                <dl className="backend-page-meta">
                  <div><dt>Stage</dt><dd>{status.stage.replaceAll("_", " ")}</dd></div>
                  <div><dt>Domain</dt><dd>{status.application?.domain || "Not specified"}</dd></div>
                  <div><dt>Submitted</dt><dd>{status.application?.createdAt ? new Date(status.application.createdAt).toLocaleDateString() : "—"}</dd></div>
                </dl>
                <p><a className="backend-page-link" href="/student/interview">Interview details</a></p>
              </>
            ) : (
              <>
                <h2>No application submitted yet</h2>
                <p>Start your application to see its progress here.</p>
                <a className="backend-page-link" href="/student/apply">Apply now</a>
              </>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default ApplicationTracking;
