import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiX,
  FiSave,
  FiCamera,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiPhoneOff,
} from "react-icons/fi";
import MotivationBanner from "./ui/MotivationBanner.jsx";
import MentorSidebar from "./MentorSidebar";
import LoadingPage from "./LoadingPage.jsx";
import { apiRequest } from "../utils/api.js";
import "./Interviewpage.css";

const CRITERIA = [
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical understanding" },
  { key: "confidence", label: "Confidence in explaining" },
  { key: "problemSolving", label: "Problem solving" },
];

const EMPTY_SCORES = {
  communication: 5,
  technical: 5,
  confidence: 5,
  problemSolving: 5,
};

const DECISIONS = ["Shortlisted", "Rejected", "On Hold", "Further Evaluation Required"];
const FILTERS = ["All", "Scheduled", "Completed", "Not Scheduled"];

const decisionLabels = {
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
  ON_HOLD: "On Hold",
  FURTHER_EVALUATION: "Further Evaluation Required",
};

const decisionValues = Object.fromEntries(
  Object.entries(decisionLabels).map(([value, label]) => [label, value])
);

const mapCandidate = (candidate) => {
  const interview = candidate.interview || {};
  const scores = Object.fromEntries(
    CRITERIA.map(({ key }) => [key, interview.scores?.[key] ?? 5])
  );
  const status = {
    COMPLETED: "Completed",
    SCHEDULED: "Scheduled",
    NOT_SCHEDULED: "Not Scheduled",
  }[candidate.interviewStatus] || "Not Scheduled";

  return {
    id: String(candidate.applicationId),
    name: candidate.fullName,
    branch: [candidate.branch, candidate.year].filter(Boolean).join(" · ") || "Branch not set",
    exam: candidate.taskAverageScore,
    date: interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString() : "Not set",
    mode: interview.mode ? interview.mode[0] + interview.mode.slice(1).toLowerCase() : "-",
    status,
    interviewer: interview.panelistName || "",
    meetingLink: interview.meetLinkOrVenue || "",
    notificationsSent: Boolean(interview.notificationsSent),
    participantsJoined: Boolean(interview.participantsJoined),
    interviewConducted: Boolean(interview.interviewConducted),
    interviewNotes: interview.interviewNotes || "",
    evaluation: interview.score !== null && interview.score !== undefined && interview.decision
      ? {
          scores,
          feedback: interview.feedback || "",
          decision: decisionLabels[interview.decision] || interview.decision,
          total: interview.score,
        }
      : undefined,
    resultPublished: Boolean(interview.resultPublished),
  };
};

const fetchCandidates = async () => {
  const data = await apiRequest("/api/interviews");
  return (data.candidates || []).map(mapCandidate);
};

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

const Interviewpage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [savingAction, setSavingAction] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  // Evaluation panel state
  const [selectedId, setSelectedId] = useState("");
  const [scores, setScores] = useState(EMPTY_SCORES);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("");

  // Schedule modal state
  const [showModal, setShowModal] = useState(false);
  const [schedule, setSchedule] = useState({
    id: "",
    date: "",
    time: "",
    mode: "Online",
    interviewer: "",
  });
  const [interviewNotes, setInterviewNotes] = useState("");
  const [workflowNotice, setWorkflowNotice] = useState("");

  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callCandidateId, setCallCandidateId] = useState("");
  const localVideoRef = useRef(null);
  const cameraRequestRef = useRef(0);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      setCandidates(await fetchCandidates());
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchCandidates()
      .then((data) => {
        if (active) {
          setCandidates(data);
          setApiError("");
        }
      })
      .catch((error) => {
        if (active) setApiError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    cameraRequestRef.current += 1;
  }, []);

  useEffect(() => {
    if (!cameraStream) return undefined;
    if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;

    return () => {
      cameraStream.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  const startCall = async () => {
    if (!callCandidateId) {
      setCameraError("Select a candidate before starting the interview call.");
      return;
    }

    const requestId = cameraRequestRef.current + 1;
    cameraRequestRef.current = requestId;
    setCameraLoading(true);
    setCameraError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera and microphone access is not available in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      setCameraStream(stream);
      setIsMuted(false);
      setIsCameraOn(true);
    } catch (error) {
      if (requestId === cameraRequestRef.current) {
        setCameraError(
          error instanceof Error
            ? error.message
            : "Unable to access the camera and microphone."
        );
      }
    } finally {
      if (requestId === cameraRequestRef.current) setCameraLoading(false);
    }
  };

  const stopCall = () => {
    cameraRequestRef.current += 1;
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setCameraError("");
    setIsMuted(false);
    setIsCameraOn(true);
  };

  const toggleMicrophone = () => {
    const audioTrack = cameraStream?.getAudioTracks()[0];
    if (!audioTrack) {
      setCameraError("The microphone track is unavailable. End the preview and try again.");
      return;
    }

    audioTrack.enabled = isMuted;
    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    const videoTrack = cameraStream?.getVideoTracks()[0];
    if (!videoTrack) {
      setCameraError("The camera track is unavailable. End the preview and try again.");
      return;
    }

    videoTrack.enabled = !isCameraOn;
    setIsCameraOn(!isCameraOn);
  };

  const stats = useMemo(
    () => ({
      total: candidates.length,
      scheduled: candidates.filter((c) => c.status === "Scheduled").length,
      completed: candidates.filter((c) => c.status === "Completed").length,
      unscheduled: candidates.filter((c) => c.status === "Not Scheduled").length,
    }),
    [candidates]
  );

  const statCards = [
    { label: "Candidates", value: stats.total, icon: <FiUsers /> },
    { label: "Scheduled", value: stats.scheduled, icon: <FiCalendar /> },
    { label: "Completed", value: stats.completed, icon: <FiCheckCircle /> },
    { label: "Not scheduled", value: stats.unscheduled, icon: <FiClock /> },
  ];

  const visible = candidates.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const selected = candidates.find((c) => c.id === selectedId);

  // Average of the four scores (each out of 10), shown out of 100
  const total = Math.round(
    (Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length) * 10
  );

  const openEvaluation = (c) => {
    setSelectedId(c.id);
    setScores(c.evaluation?.scores || EMPTY_SCORES);
    setFeedback(c.evaluation?.feedback || "");
    setDecision(c.evaluation?.decision || "");
    setInterviewNotes(c.interviewNotes || c.evaluation?.feedback || "");
    setCallCandidateId(String(c.id));
  };

  const openSchedule = (id = "") => {
    setSchedule({ id: String(id), date: "", time: "", mode: "Online", interviewer: "" });
    setShowModal(true);
  };

  const saveEvaluation = async () => {
    if (
      !selected
      || (!selected.interviewConducted && selected.status !== "Completed")
      || !decision
    ) return;
    setSavingAction(true);
    setApiError("");
    try {
      await apiRequest(`/api/interviews/${encodeURIComponent(selected.id)}/evaluate`, {
        method: "PATCH",
        body: {
          scores,
          feedback,
          interviewNotes: interviewNotes.trim(),
          decision: decisionValues[decision],
        },
      });
      await loadCandidates();
      setWorkflowNotice("Evaluation saved. Publish the result to complete the workflow.");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingAction(false);
    }
  };

  const updateWorkflow = async (candidate, body, notice) => {
    if (!candidate) return;
    setSavingAction(true);
    setApiError("");
    try {
      await apiRequest(`/api/interviews/${encodeURIComponent(candidate.id)}/workflow`, {
        method: "PATCH",
        body,
      });
      await loadCandidates();
      setWorkflowNotice(notice);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingAction(false);
    }
  };

  const markNotificationsSent = () => updateWorkflow(
    workflowCandidate,
    { notificationsSent: true },
    "Notification marked sent. Send the copied details to both participants outside this app."
  );

  const markParticipantsJoined = () => updateWorkflow(
    workflowCandidate,
    { participantsJoined: true },
    "Both participants marked as joined."
  );

  const markInterviewConducted = () => {
    if (!selected || !interviewNotes.trim() || !selected.participantsJoined) return;
    return updateWorkflow(
      selected,
      { interviewConducted: true, interviewNotes: interviewNotes.trim() },
      "Interview notes saved and interview marked as conducted."
    );
  };

  const publishResult = async () => {
    if (!selected?.evaluation) return;
    setSavingAction(true);
    setApiError("");
    try {
      await apiRequest(`/api/interviews/${encodeURIComponent(selected.id)}/publish`, {
        method: "PATCH",
      });
      await loadCandidates();
      setWorkflowNotice(`Result published: ${selected.evaluation.decision}.`);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingAction(false);
    }
  };

  const copyInterviewDetails = async () => {
    if (!workflowCandidate) return;
    const details = [
      `SocietySelect interview: ${workflowCandidate.name}`,
      `Date and time: ${workflowCandidate.date}`,
      `Mode: ${workflowCandidate.mode}`,
      `Interviewer: ${workflowCandidate.interviewer || "Not specified"}`,
      workflowCandidate.meetingLink ? `Meeting link: ${workflowCandidate.meetingLink}` : "",
    ].filter(Boolean).join("\n");

    try {
      await navigator.clipboard.writeText(details);
      setWorkflowNotice("Interview details copied. Send them to the student and mentor.");
    } catch (error) {
      setWorkflowNotice(
        error instanceof Error
          ? `Could not copy interview details: ${error.message}`
          : "Could not copy interview details. Copy the meeting link shown below."
      );
    }
  };

  const saveSchedule = async (e) => {
    e.preventDefault();
    if (!schedule.id) return;
    setSavingAction(true);
    setApiError("");
    try {
      await apiRequest(`/api/interviews/${encodeURIComponent(schedule.id)}/schedule`, {
        method: "PATCH",
        body: {
          scheduledAt: new Date(`${schedule.date}T${schedule.time}`).toISOString(),
          mode: schedule.mode.toUpperCase(),
          panelistName: schedule.interviewer.trim(),
          meetLinkOrVenue: "",
          instructions: "",
        },
      });
      await loadCandidates();
      setCallCandidateId(schedule.id);
      setSelectedId(schedule.id);
      setShowModal(false);
      setWorkflowNotice("Interview scheduled. Share the details with the student and mentor.");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSavingAction(false);
    }
    setScores(EMPTY_SCORES);
    setFeedback("");
    setDecision("");
    setInterviewNotes("");
  };

  const workflowCandidate =
    candidates.find((candidate) => String(candidate.id) === callCandidateId) || selected;

  if (loading) return <LoadingPage />;

  return (
    <div className="im-page">
      <div className="im-app-shell">
        <MentorSidebar />

        <main className="im-main-content">

      {/* Header */}
      <header className="im-head">
        <div>
          <h1 className="im-title">Interview Management</h1>
        </div>
        <button className="im-primary" onClick={() => openSchedule()}>
          <FiPlus /> Schedule Interview
        </button>
      </header>

      {apiError && <p className="im-camera-error" role="alert">{apiError}</p>}
      <MotivationBanner />

      {/* Stat cards */}
      <section className="im-stats">
        {statCards.map((s) => (
          <div className="im-stat" key={s.label}>
            <div className="im-stat-icon">{s.icon}</div>
            <div>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="im-grid">
        {/* Candidate list */}
        <section className="im-card" id="candidate-list">
          <div className="im-toolbar">
            <label className="im-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search candidate"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="im-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`im-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!loading && visible.length === 0 && <p className="im-none">No candidates found.</p>}

          {visible.map((c) => (
            <div key={c.id} className={`im-row ${selectedId === c.id ? "selected" : ""}`}>
              <div className="im-person">
                <div className="im-avatar">{initials(c.name)}</div>
                <div>
                  <p className="im-name">{c.name}</p>
                  <p className="im-meta">{c.branch}</p>
                </div>
              </div>

              <div className="im-when">
                <span>{c.date}</span>
                <span className="im-meta">{c.mode}</span>
              </div>

              <span className={`im-badge status-${c.status.toLowerCase().replace(" ", "-")}`}>
                {c.status}
              </span>

              <button
                type="button"
                className="im-row-btn"
                onClick={() =>
                  c.status === "Not Scheduled" ? openSchedule(c.id) : openEvaluation(c)
                }
              >
                {c.status === "Completed"
                  ? "View / Edit"
                  : c.status === "Scheduled"
                  ? "Evaluate"
                  : "Schedule"}
              </button>
            </div>
          ))}
        </section>

        {/* Evaluation panel */}
        <aside className="im-eval" id="student-scores">
          <label className="im-call-candidate" htmlFor="im-call-candidate">
            Interview candidate
            <select
              id="im-call-candidate"
              value={callCandidateId}
              onChange={(e) => {
                const candidate = candidates.find((item) => String(item.id) === e.target.value);
                if (candidate) openEvaluation(candidate);
                else {
                  setCallCandidateId("");
                  setSelectedId(null);
                }
              }}
              disabled={Boolean(cameraStream)}
            >
              <option value="">Select a candidate</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </label>

          <section className="im-call-panel" id="interview-call" aria-labelledby="im-call-title">
            <header className="im-call-header">
              <div>
                <h2 id="im-call-title">Interview call</h2>
                <p>Candidate interview room</p>
              </div>
              <span className={`im-call-status ${cameraStream ? "preview" : ""}`}>
                <span aria-hidden="true" />
                {cameraStream ? "Local preview" : "Ready to join"}
              </span>
            </header>

            {workflowCandidate?.meetingLink && (
              <a
                className="im-meeting-link"
                href={workflowCandidate.meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                Join SocietySelect AI interview
              </a>
            )}

            {workflowCandidate?.interviewer && (
              <div className="im-call-actions">
                <p>Interview details for {workflowCandidate.name}</p>
                <button type="button" onClick={copyInterviewDetails}>
                  Copy interview details
                </button>
                <button
                  type="button"
                  onClick={markNotificationsSent}
                  disabled={savingAction || Boolean(workflowCandidate.notificationsSent)}
                >
                  {workflowCandidate.notificationsSent ? "Details marked sent" : "Mark notifications sent"}
                </button>
                <button
                  type="button"
                  onClick={markParticipantsJoined}
                  disabled={savingAction || !workflowCandidate.notificationsSent || Boolean(workflowCandidate.participantsJoined)}
                >
                  {workflowCandidate.participantsJoined ? "Participants joined" : "Confirm both participants joined"}
                </button>
              </div>
            )}
            {workflowNotice && <p className="im-call-feedback" role="status">{workflowNotice}</p>}

            <div className="im-call-tiles">
              <div className="im-call-tile">
                {cameraStream ? (
                  <>
                    <video
                      ref={localVideoRef}
                      className="im-call-video"
                      autoPlay
                      muted
                      playsInline
                      aria-label="Your camera preview"
                    />
                    {!isCameraOn && (
                      <div className="im-call-camera-off">
                        <FiVideoOff />
                        <span>Camera off</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="im-call-placeholder">
                    <FiCamera />
                    <span>Your video</span>
                  </div>
                )}
                <span className="im-call-name">You</span>
                {isMuted && cameraStream && <FiMicOff className="im-call-mute-indicator" aria-label="Microphone muted" />}
              </div>

              <div className="im-call-tile im-call-remote">
                <div className="im-call-placeholder">
                  <FiUsers />
                  {callCandidateId && <span>Waiting for candidate</span>}
                </div>
                <span className="im-call-name">
                  {candidates.find((candidate) => String(candidate.id) === callCandidateId)?.name
                    || "Candidate"}
                </span>
              </div>
            </div>

            {cameraError && <p className="im-camera-error" role="alert">{cameraError}</p>}

            <div className="im-call-controls">
              {cameraStream ? (
                <>
                  <button type="button" onClick={toggleMicrophone} aria-pressed={isMuted}>
                    {isMuted ? <FiMicOff /> : <FiMic />}
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                  <button type="button" onClick={toggleCamera} aria-pressed={!isCameraOn}>
                    {isCameraOn ? <FiCamera /> : <FiVideoOff />}
                    {isCameraOn ? "Camera off" : "Camera on"}
                  </button>
                  <button type="button" className="im-call-end" onClick={stopCall}>
                    <FiPhoneOff />
                    End
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="im-call-start"
                  onClick={startCall}
                  disabled={cameraLoading || !callCandidateId}
                >
                  <FiCamera />
                  {cameraLoading ? "Requesting access..." : "Start video call"}
                </button>
              )}
            </div>

            {!cameraStream && (
              <p className="im-call-hint">Allow camera and microphone access when your browser asks.</p>
            )}
            <p className="im-call-hint">The Jitsi room hosts the live call. This panel is only a local camera preview.</p>
          </section>

          {selected && (
            <div className="im-eval-body">
              <div className="im-eval-head">
                <div>
                  <h2 className="im-eval-name">{selected.name}</h2>
                  <p className="im-eval-meta">
                    {selected.branch} · Task average {selected.exam ?? "—"}
                  </p>
                </div>
                <div className="im-total">
                  {total}
                  <small>/100</small>
                </div>
              </div>

              <label className="im-notes-label" htmlFor="im-interview-notes">
                Interview notes
                <textarea
                  id="im-interview-notes"
                  placeholder="Record questions, answers and interview notes..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  disabled={Boolean(selected.interviewConducted || selected.status === "Completed")}
                />
              </label>
              {!selected.interviewConducted && selected.status !== "Completed" && (
                <button
                  type="button"
                  className="im-save"
                  onClick={markInterviewConducted}
                  disabled={savingAction || !selected.participantsJoined || !interviewNotes.trim()}
                >
                  Mark interview conducted
                </button>
              )}

              {CRITERIA.map((c) => (
                <div className="im-crit" key={c.key}>
                  <div className="im-crit-label">
                    <span>{c.label}</span>
                    <span>{scores[c.key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={scores[c.key]}
                    onChange={(e) =>
                      setScores({ ...scores, [c.key]: Number(e.target.value) })
                    }
                  />
                </div>
              ))}

              <textarea
                placeholder="Write feedback for this candidate..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <div className="im-chips">
                {DECISIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`im-chip ${decision === d ? "active" : ""}`}
                    onClick={() => setDecision(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="im-save"
                onClick={saveEvaluation}
                disabled={
                  savingAction
                  ||
                  !decision
                  || (!selected.interviewConducted && selected.status !== "Completed")
                }
              >
                <FiSave /> Save evaluation
              </button>
              {selected.evaluation && (
                <button
                  type="button"
                  className="im-save im-publish"
                  onClick={publishResult}
                  disabled={savingAction || Boolean(selected.resultPublished)}
                >
                  {selected.resultPublished ? "Result published" : "Publish interview result"}
                </button>
              )}
              <p className="im-note">
                Publishing saves the result and updates the student&apos;s recruitment status.
              </p>
            </div>
          )}
        </aside>
      </div>
        </main>
      </div>

      {/* Schedule modal */}
      {showModal && (
        <div className="im-overlay" onClick={() => setShowModal(false)}>
          <form
            className="im-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={saveSchedule}
          >
            <div className="im-modal-head">
              <h2>Schedule Interview</h2>
              <button type="button" className="im-close" onClick={() => setShowModal(false)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="im-field">
              <select
                required
                value={schedule.id}
                onChange={(e) => setSchedule({ ...schedule, id: e.target.value })}
              >
                <option value="">Select candidate</option>
                {candidates
                  .filter((c) => c.status !== "Completed")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="im-field">
              <input
                type="date"
                required
                value={schedule.date}
                onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
              />
            </div>

            <div className="im-field">
              <input
                type="time"
                required
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              />
            </div>

            <div className="im-field">
              <select
                value={schedule.mode}
                onChange={(e) => setSchedule({ ...schedule, mode: e.target.value })}
              >
                <option>Online</option>
                <option>Offline</option>
              </select>
            </div>

            <div className="im-field">
              <input
                type="text"
                required
                placeholder="Interviewer name"
                value={schedule.interviewer}
                onChange={(e) => setSchedule({ ...schedule, interviewer: e.target.value })}
              />
            </div>

            <button type="submit" className="im-primary im-full" disabled={savingAction}>
              {savingAction ? "Saving..." : "Confirm schedule"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Interviewpage;