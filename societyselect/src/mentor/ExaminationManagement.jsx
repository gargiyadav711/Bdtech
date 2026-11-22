import MentorSidebar from "../Components/MentorSidebar";
import { useState } from "react";
import {Plus,ExternalLink,CalendarDays,Clock,Users, ClipboardCheck,CheckCircle2,XCircle,AlertCircle,Link as LinkIcon,X,Eye} from "lucide-react";
import "./ExaminationManagement.css";
function ExaminationManagement() {
    const [exams, setExams] = useState([
        {
            id: 1,
            name: "Probation Examination - Round 1",
            subject: "Data Structures",
            date: "25 Nov 2026",
            time: "10:00 AM",
            duration: "60 minutes",
            totalStudents: 45,
            appeared: 0,
            passed: 0,
            failed: 0,
            status: "Upcoming",
            link: "",
            passingMarks: 40,
            totalMarks: 100
        }
    ]);

    const [showForm, setShowForm] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    const [form, setForm] = useState({
        name: "",
        subject: "",
        date: "",
        time: "",
        duration: "60",
        totalStudents: "",
        passingMarks: "40",
        totalMarks: "100",
        link: ""
    });

    const resetForm = () => {
        setForm({
            name: "",
            subject: "",
            date: "",
            time: "",
            duration: "60",
            totalStudents: "",
            passingMarks: "40",
            totalMarks: "100",
            link: ""
        });
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const addUnstopAssessment = (e) => {
        e.preventDefault();

        const newExam = {
            id: Date.now(),
            name: form.name,
            subject: form.subject,
            date: new Date(form.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }),
            time: form.time,
            duration: `${form.duration} minutes`,
            totalStudents: Number(form.totalStudents),
            appeared: 0,
            passed: 0,
            failed: 0,
            status: "Upcoming",
            link: form.link,
            passingMarks: Number(form.passingMarks),
            totalMarks: Number(form.totalMarks)
        };

        setExams((previousExams) => [newExam, ...previousExams]);
        setShowForm(false);
        resetForm();
    };

    const totalStudents = exams.reduce(
        (sum, exam) => sum + exam.totalStudents, 0
    );

    const totalPassed = exams.reduce(
        (sum, exam) => sum + exam.passed, 0
    );

    const totalFailed = exams.reduce(
        (sum, exam) => sum + exam.failed, 0
    );

    const stats = [
        {
            label: "Total Exams",
            value: exams.length
        },
        {
            label: "Assigned Students",
            value: totalStudents
        },
        {
            label: "Students Passed",
            value: totalPassed
        },
        {
            label: "Students Failed",
            value: totalFailed
        }
    ];

    return (
        <div className="exam-management">
            <MentorSidebar />
            <main className="exam-main-content">
                <div className="exam-header">
                    <div>
                        <h1>Examination Management</h1>
                    </div>
                    <button
                        className="add-exam-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={18} />
                        Add Unstop Assessment
                    </button>
                </div>

                <div className="exam-stats">
                    {stats.map((stat, index) => (
                        <div className="exam-stat-card" key={index}>
                            <div>
                                <p>{stat.label}</p>
                                <h2>{stat.value}</h2>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="exam-content">
                    <div className="exam-section-heading">
                        <div>
                            <h2>Probation Examination Rounds</h2>
                        </div>
                    </div>

                    <div className="exam-list">
                        {exams.map((exam) => (
                            <div className="exam-card" key={exam.id}>
                                <div className="exam-card-top">
                                    <div className="exam-title-group">
                                        <div className="exam-subject-icon">
                                            <ClipboardCheck size={22} />
                                        </div>

                                        <div>
                                            <h3>{exam.name}</h3>
                                            <p>{exam.subject}</p>
                                        </div>
                                    </div>

                                    <span className={`exam-status ${
                                        exam.status === "Upcoming" ? "upcoming" : "completed"
                                    }`}>
                                        {exam.status}
                                    </span>
                                </div>

                                <div className="exam-details">
                                    <div>
                                        <CalendarDays size={17} />
                                        <span>{exam.date}</span>
                                    </div>

                                    <div>
                                        <Clock size={17} />
                                        <span>{exam.time}</span>
                                    </div>

                                    <div>
                                        <Clock size={17} />
                                        <span>{exam.duration}</span>
                                    </div>

                                    <div>
                                        <Users size={17} />
                                        <span>{exam.totalStudents} Students</span>
                                    </div>
                                </div>

                                <div className="exam-progress">
                                    <div className="progress-heading">
                                        <span>Exam Participation</span>
                                        <strong>
                                            {exam.appeared}/{exam.totalStudents}
                                        </strong>
                                    </div>

                                    <div className="progress-track">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${
                                                    exam.totalStudents
                                                        ? (exam.appeared / exam.totalStudents) * 100
                                                        : 0
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="exam-result-summary">
                                    <div>
                                        <CheckCircle2 size={16} />
                                        <span>Passed: <strong>{exam.passed}</strong></span>
                                    </div>

                                    <div>
                                        <XCircle size={16} />
                                        <span>Failed: <strong>{exam.failed}</strong></span>
                                    </div>

                                    <div>
                                        <AlertCircle size={16} />
                                        <span>
                                            Pending: <strong>{exam.totalStudents - exam.appeared}</strong>
                                        </span>
                                    </div>
                                </div>

                                <div className="exam-card-footer">
                                    <div className="exam-platform">
                                        <span className="unstop-dot" />
                                        Unstop Assessment
                                    </div>

                                    <div className="exam-actions">
                                        {exam.link && (
                                            <button
                                                className="outline-btn"
                                                onClick={() => window.open(
                                                    exam.link,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )}
                                            >
                                                <ExternalLink size={15} />
                                                Open Exam
                                            </button>
                                        )}

                                        <button
                                            className="view-btn"
                                            onClick={() => setSelectedExam(exam)}
                                        >
                                            <Eye size={16} />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {exams.length === 0 && (
                            <div className="empty-exams">
                                <ClipboardCheck size={36} />
                                <h3>No examinations found</h3>
                                <p>Try another search or add a Unstop assessment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {showForm && (
                <div className="exam-modal-overlay">
                    <div className="exam-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Add Unstop Assessment</h2>
                                <p>Link an assessment already created on Unstop.</p>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form onSubmit={addUnstopAssessment}>
                            <div className="form-group">
                                <label>Examination Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Probation Examination - Round 1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder="Enter subject name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Unstop Assessment Link</label>
                                <div className="link-input">
                                    <LinkIcon size={18} />
                                    <input
                                        type="url"
                                        name="link"
                                        value={form.link}
                                        onChange={handleChange}
                                        placeholder="https://unstop.com/..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Exam Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Exam Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={form.time}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Total Students</label>
                                    <input
                                        type="number"
                                        name="totalStudents"
                                        value={form.totalStudents}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Total Marks</label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        value={form.totalMarks}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Passing Marks</label>
                                    <input
                                        type="number"
                                        name="passingMarks"
                                        value={form.passingMarks}
                                        onChange={handleChange}
                                        min="0"
                                        max={form.totalMarks}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="unstop-note">
                                <AlertCircle size={17} />
                                Create and publish the actual examination on Unstop first.
                                Paste its candidate assessment link here.
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="save-exam-btn">
                                    <Plus size={16} />
                                    Add Assessment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedExam && (
                <div className="exam-modal-overlay">
                    <div className="exam-modal details-modal">
                        <div className="modal-header">
                            <div>
                                <h2>Examination Details</h2>
                                <p>{selectedExam.name}</p>
                            </div>

                            <button
                                className="close-modal"
                                onClick={() => setSelectedExam(null)}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="details-grid">
                            <div>
                                <span>Subject</span>
                                <strong>{selectedExam.subject}</strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong>{selectedExam.status}</strong>
                            </div>

                            <div>
                                <span>Total Marks</span>
                                <strong>{selectedExam.totalMarks}</strong>
                            </div>

                            <div>
                                <span>Passing Marks</span>
                                <strong>{selectedExam.passingMarks}</strong>
                            </div>

                            <div>
                                <span>Assigned Students</span>
                                <strong>{selectedExam.totalStudents}</strong>
                            </div>

                            <div>
                                <span>Appeared</span>
                                <strong>{selectedExam.appeared}</strong>
                            </div>

                            <div>
                                <span>Passed</span>
                                <strong>{selectedExam.passed}</strong>
                            </div>

                            <div>
                                <span>Failed</span>
                                <strong>{selectedExam.failed}</strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedExam.link && (
                                <button
                                    className="save-exam-btn"
                                    onClick={() => window.open(
                                        selectedExam.link,
                                        "_blank",
                                        "noopener,noreferrer"
                                    )}
                                >
                                    <ExternalLink size={16} />
                                    Open Unstop
                                </button>
                            )}

                            <button
                                className="cancel-btn"
                                onClick={() => setSelectedExam(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExaminationManagement;