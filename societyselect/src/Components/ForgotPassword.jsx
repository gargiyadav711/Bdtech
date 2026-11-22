import { useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";
import { apiRequest } from "../utils/api.js";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  // Steps: 1 = Request OTP, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // STEP 1: Send Reset OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith("@akgec.ac.in")) {
      setErrorMsg("Please enter your official AKGEC email (@akgec.ac.in)");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email: cleanEmail, role },
        auth: false,
      });

      setStep(2);
      setInfoMsg(data.message || "Reset OTP sent to your email!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify 6-Digit Reset OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    try {
      setLoading(true);
      const data = await apiRequest("/api/auth/verify-reset-otp", {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        },
        auth: false,
      });

      setResetToken(data.resetToken);
      setStep(3);
      setInfoMsg("OTP verified! Enter your new password below.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: {
          email: email.trim().toLowerCase(),
          role,
          resetToken,
          password,
          confirmPassword,
        },
        auth: false,
      });

      setStep(4);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        {/* LEFT SIDE - MULTI-STEP RESET FORM */}
        <div className="forgot-form-panel">
          {step === 1 && (
            <form onSubmit={handleSendOtp} autoComplete="off">
              <div className="lock-icon">
                <FaLock aria-hidden="true" />
              </div>
              <h1>Forgot Password?</h1>
              <p className="forgot-description">
                Enter your registered AKGEC email address and account type to
                receive a 6-digit password reset OTP.
              </p>

              {errorMsg && <p className="forgot-error-banner">{errorMsg}</p>}

              <div className="forgot-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
                <small>Use your AKGEC email: name12345@akgec.ac.in</small>
              </div>

              <div className="forgot-input-group">
                <label>Account Type</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor</option>
                </select>
              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading ? "SENDING..." : "SEND RESET OTP"}
              </button>

              <a href="/login" className="back-login">
                <FaArrowLeft aria-hidden="true" /> Back to Sign In
              </a>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} autoComplete="off">
              <div className="lock-icon">
                <FaLock aria-hidden="true" />
              </div>
              <h1>Verify OTP</h1>
              <p className="forgot-description">
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </p>

              {errorMsg && <p className="forgot-error-banner">{errorMsg}</p>}
              {infoMsg && <p className="forgot-info-banner">{infoMsg}</p>}

              <div className="forgot-input-group">
                <label>6-Digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading ? "VERIFYING..." : "VERIFY OTP"}
              </button>

              <button
                type="button"
                className="forgot-resend-btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} autoComplete="off">
              <div className="lock-icon">
                <FaLock aria-hidden="true" />
              </div>
              <h1>Reset Password</h1>
              <p className="forgot-description">
                Create a strong new password for your account.
              </p>

              {errorMsg && <p className="forgot-error-banner">{errorMsg}</p>}
              {infoMsg && <p className="forgot-info-banner">{infoMsg}</p>}

              <div className="forgot-input-group">
                <label>New Password</label>
                <div className="forgot-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password (min 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="forgot-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="forgot-input-group">
                <label>Confirm New Password</label>
                <div className="forgot-password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="forgot-eye-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="forgot-success">
              <div className="success-check">
                <FaCheck aria-hidden="true" />
              </div>
              <h1>Password Updated!</h1>
              <p>
                Your password for <strong>{email}</strong> has been reset
                successfully. You can now sign in with your new password.
              </p>
              <a
                href="/login"
                className="forgot-submit-btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                GO TO SIGN IN
              </a>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - WELCOME PANEL */}
        <div className="forgot-welcome-panel">
          <div className="forgot-welcome-content">
            <h2>
              Welcome To
              <br />
              The SocietySelect
            </h2>
            <p>
              Your journey towards discovering your technical potential starts
              here.
            </p>
            <a href="/login" className="welcome-signin-btn">
              SIGN IN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;