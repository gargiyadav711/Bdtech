import { useEffect, useState } from "react";
import LoadingPage from "../../Components/LoadingPage.jsx";
import { apiRequest } from "../../utils/api.js";
import "./StudentApiPages.css";

const InterviewDetails = () => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest("/api/application/interview")
      .then((data) => {
        if (active) setDetails(data);
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

  const interview = details?.interview;

  if (loading) return <LoadingPage />;

  return (
    <main className="backend-page">
      <div className="backend-page-content">
        <header className="backend-page-header">
          <div>
            <h1>Interview Details</h1>
            <p>Your interview schedule and published result.</p>
          </div>
          <a className="backend-page-link" href="/student/dashboard">Dashboard</a>
        </header>

        {error ? <p className="backend-page-error" role="alert">{error}</p> : null}
        {!error ? (
          <section className="backend-page-card">
            {!details?.scheduled || !interview ? (
              <>
                <h2>No interview scheduled</h2>
                <p>Your interview details will appear here once they are scheduled.</p>
              </>
            ) : (
              <>
                <h2>{details.domain || "Interview"}</h2>
                <dl className="backend-page-meta">
                  <div><dt>Date and time</dt><dd>{interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : "Not set"}</dd></div>
                  <div><dt>Mode</dt><dd>{interview.mode || "Not set"}</dd></div>
                  <div><dt>Interviewer</dt><dd>{interview.panelistName || "Not specified"}</dd></div>
                  <div><dt>Meeting link / venue</dt><dd>{interview.meetLinkOrVenue || "Not provided"}</dd></div>
                </dl>
                {interview.instructions ? <p>{interview.instructions}</p> : null}
                {interview.mode === "ONLINE" && interview.meetLinkOrVenue ? (
                  <p><a className="backend-page-link" href={interview.meetLinkOrVenue} target="_blank" rel="noreferrer">Join interview</a></p>
                ) : null}
                {interview.resultPublished ? (
                  <p>Result: <strong>{interview.decision?.replaceAll("_", " ")}</strong> · Score: {interview.score ?? "—"}/100</p>
                ) : (
                  <p>Interview result has not been published yet.</p>
                )}
              </>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default InterviewDetails;
