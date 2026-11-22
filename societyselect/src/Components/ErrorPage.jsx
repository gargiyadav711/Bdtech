import { FiArrowLeft, FiRefreshCw, FiCompass } from "react-icons/fi";
import { useEffect, useState } from "react";
import "./ErrorPage.css";

export default function ErrorPage({
  code = "404",
  title = "Lost in space",
  message = "The page you're looking for doesn't exist, was moved, or never existed in the first place.",
}) {
  const [retrying, setRetrying] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    setTypedTitle("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedTitle(title.slice(0, index));

      if (index >= title.length) {
        window.clearInterval(interval);
      }
    }, 70);

    return () => window.clearInterval(interval);
  }, [title]);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/");
    }
  };

  const retry = () => {
    setRetrying(true);
    window.setTimeout(() => window.location.reload(), 150);
  };

  return (
    <main className="error-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <section className="error-card">
        <div className="error-icon">
          <FiCompass />
        </div>

        <h1 className="error-code">{code}</h1>
        <h2 className="error-title" aria-label={title}>
          <span aria-hidden="true">{typedTitle}</span>
          <span className="typing-cursor" aria-hidden="true" />
        </h2>
        <p className="error-message">{message}</p>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={goBack}>
            <FiArrowLeft /> Go back
          </button>
          <button className="btn btn-ghost" onClick={retry} disabled={retrying}>
            <FiRefreshCw /> {retrying ? "Retrying..." : "Retry"}
          </button>
        </div>
      </section>
    </main>
  );
}