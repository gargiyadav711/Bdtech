import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaLinkedinIn,
  FaTimes,
} from "react-icons/fa";
import "./welcome.css";

const API_BASE = import.meta.env.PROD
  ? "/api/auth"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/auth";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function LoginPage({ initialMode = "login" }) {
  const [isSignup, setIsSignup] = useState(initialMode === "signup");

  // Guard to block browser autofill on initial page load
  const [inputUnlocked, setInputUnlocked] = useState(false);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login State
  const [loginRole, setLoginRole] = useState("STUDENT");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Signup State
  const [signupRole, setSignupRole] = useState("STUDENT");
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    domain: "",
    studentNumber: "",
  });

  // OTP & Verification Token State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");

  // Profile Modal State
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState("");

  const [modalRole, setModalRole] = useState("STUDENT");

  // UI Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const extractError = (data, fallback) => {
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message;
    }
    return data?.message || fallback;
  };

  const saveAuthSession = (data) => {
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  const redirectStudentToDashboard = (role) => {
    if (String(role || "").toUpperCase() !== "STUDENT") return false;
    window.location.assign("/student/dashboard");
    return true;
  };

  // Clear all form fields on mount & listen for Google popup callback
  useEffect(() => {
    setLoginData({ email: "", password: "" });
    setSignupData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      domain: "",
      studentNumber: "",
    });

    // If this window IS the Google OAuth popup returning with #id_token=...
    if (window.opener && window.location.hash.includes("id_token=")) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const idToken = params.get("id_token");
      if (idToken) {
        window.opener.postMessage(
          { type: "GOOGLE_ID_TOKEN", idToken },
          window.location.origin
        );
        window.close();
      }
    }
  }, []);

  // Listen for the ID token sent from the Google Account Chooser popup
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GOOGLE_ID_TOKEN" && event.data.idToken) {
        await verifyGoogleTokenWithBackend(event.data.idToken);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && isEmailVerified) {
      setIsEmailVerified(false);
      setEmailVerificationToken("");
    }
  };

  // STEP 1: Send / Resend OTP
  const handleSendOtp = async (isResend = false) => {
    setErrorMsg("");
    setInfoMsg("");

    const email = signupData.email.trim().toLowerCase();
    if (!email.endsWith("@akgec.ac.in")) {
      setErrorMsg(
        "Only official AKGEC email addresses (@akgec.ac.in) are allowed"
      );
      return;
    }

    try {
      setLoading(true);
      const endpoint = isResend ? "resend-otp" : "send-otp";
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractError(data, "Failed to send OTP"));
      }

      setShowOtpModal(true);
      setInfoMsg(data.message || "OTP sent to your college email!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractError(data, "Invalid OTP"));
      }

      setIsEmailVerified(true);
      setEmailVerificationToken(data.verificationToken);
      setShowOtpModal(false);
      setOtp("");
      setInfoMsg("Email verified! Complete your details and click SIGN UP.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Open Domain & Student Number Modal
  const handleSignupStepOne = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isEmailVerified || !emailVerificationToken) {
      setErrorMsg("Please verify your college email with OTP first.");
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setPendingGoogleToken("");
    setShowProfileForm(true);
  };

  // STEP 4: Final Profile Popup Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!/^[0-9]{3,20}$/.test(signupData.studentNumber.trim())) {
      setErrorMsg("Student number must contain 3 to 20 digits only.");
      return;
    }

    try {
      setLoading(true);

      if (pendingGoogleToken) {
        const res = await fetch(`${API_BASE}/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            idToken: pendingGoogleToken,
            role: modalRole,
            studentNumber: signupData.studentNumber.trim(),
            domain: signupData.domain.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(extractError(data, "Google registration failed"));
        }

        if (data.requiresStudentNumber) {
          setErrorMsg(
            "Backend did not receive studentNumber or domain. Check googleAuthSchema in auth.validator.js."
          );
          return;
        }

        saveAuthSession(data);
        setShowProfileForm(false);
        setPendingGoogleToken("");
        setInfoMsg("");
        setSignupData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          domain: "",
          studentNumber: "",
        });
        if (redirectStudentToDashboard(data.user?.role || modalRole)) return;
        alert(`Welcome ${data.user?.fullName || ""}! Logged in via Google.`);
        return;
      }

      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: signupData.fullName.trim(),
          studentNumber: signupData.studentNumber.trim(),
          email: signupData.email.trim().toLowerCase(),
          domain: signupData.domain.trim(),
          emailVerificationToken,
          password: signupData.password,
          confirmPassword: signupData.confirmPassword,
          role: signupRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractError(data, "Registration failed"));
      }

      saveAuthSession(data);
      if (redirectStudentToDashboard(data.user?.role || signupRole)) return;

      setShowProfileForm(false);
      alert("Account created successfully! Please sign in.");
      setIsSignup(false);
      setLoginData({ email: "", password: "" });
      setSignupData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        domain: "",
        studentNumber: "",
      });
      setIsEmailVerified(false);
      setEmailVerificationToken("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN SUBMIT
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
          role: loginRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractError(data, "Login failed"));
      }

      saveAuthSession(data);

      setLoginData({ email: "", password: "" });
      if (redirectStudentToDashboard(data.user?.role || loginRole)) return;
      alert(`Welcome back, ${data.user.fullName} (${data.user.role})!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send the Google ID token to backend /api/auth/google
  const verifyGoogleTokenWithBackend = async (idToken) => {
    const selectedRole = isSignup ? signupRole : loginRole;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`${API_BASE}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(extractError(data, "Google authentication failed"));
      }

      if (data.requiresStudentNumber) {
        setPendingGoogleToken(idToken);
        setModalRole(selectedRole);
        setShowProfileForm(true);
        setInfoMsg(data.message);
        return;
      }

      saveAuthSession(data);
      if (redirectStudentToDashboard(data.user?.role || selectedRole)) return;
      alert(`Logged in with Google as ${data.user.fullName}!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OPEN FULL GOOGLE ACCOUNT CHOOSER PAGE IN POPUP
  const handleGoogleAuth = () => {
    setErrorMsg("");
    if (!GOOGLE_CLIENT_ID) {
      setErrorMsg(
        "Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in .env"
      );
      return;
    }

    const redirectUri = new URL("/login", window.location.origin).toString();
    const nonce = Math.random().toString(36).substring(2) + Date.now();

    // prompt=select_account forces Google to open the account chooser page every time
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=id_token` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&prompt=select_account` +
      `&nonce=${encodeURIComponent(nonce)}`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      authUrl,
      "GoogleAccountChooser",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div className={`auth-page ${isSignup ? "signup-active" : ""}`}>
      <a href="/" className="auth-home-link">
        <FaArrowLeft aria-hidden="true" />
        Back to Home
      </a>

      <div className={`auth-container ${isSignup ? "active" : ""}`}>
        {/* LOGIN FORM */}
        <div className="form-panel login-panel">
          <form onSubmit={handleLoginSubmit} autoComplete="off">
            <h1>Sign in</h1>
            <div className="social-icons">
              <button
                type="button"
                aria-label="Google"
                onClick={handleGoogleAuth}
                title="Choose a Google Account"
              >
                <FaGoogle aria-hidden="true" />
              </button>
              <button type="button" aria-label="LinkedIn" disabled>
                <FaLinkedinIn aria-hidden="true" />
              </button>
            </div>
            <span className="form-hint">or use your college email account</span>

            {!isSignup && errorMsg && !showProfileForm && (
              <p className="auth-error-banner">{errorMsg}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="College Email"
              value={loginData.email}
              onChange={handleLoginChange}
              readOnly={!inputUnlocked}
              onFocus={() => setInputUnlocked(true)}
              autoComplete="off"
              required
            />
            <span className="email-hint">
              Use your AKGEC email: name12345@akgec.ac.in
            </span>

            {/* LOGIN PASSWORD WITH EYE TOGGLE */}
            <div className="password-input-wrapper">
              <input
                type={showLoginPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                readOnly={!inputUnlocked}
                onFocus={() => setInputUnlocked(true)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={
                  showLoginPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowLoginPassword((prev) => !prev)}
              >
                {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label className="role-label" htmlFor="login-role">
              Sign in as
            </label>
            <select
              id="login-role"
              className="role-select"
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="MENTOR">Mentor</option>
            </select>
            <a href="#forgot" className="forgot-link">
              Forgot your password?
            </a>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>
        </div>

        {/* SIGNUP FORM */}
        <div className="form-panel signup-panel">
          <form onSubmit={handleSignupStepOne} autoComplete="off">
            <h1>Create Account</h1>
            <div className="social-icons">
              <button
                type="button"
                aria-label="Google"
                onClick={handleGoogleAuth}
                title="Sign up with a Google Account"
              >
                <FaGoogle aria-hidden="true" />
              </button>
              <button type="button" aria-label="LinkedIn" disabled>
                <FaLinkedinIn aria-hidden="true" />
              </button>
            </div>
            <span className="form-hint">or register using your email</span>

            {isSignup && errorMsg && !showOtpModal && !showProfileForm && (
              <p className="auth-error-banner">{errorMsg}</p>
            )}
            {isSignup && infoMsg && !showOtpModal && !showProfileForm && (
              <p className="auth-info-banner">{infoMsg}</p>
            )}

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={signupData.fullName}
              onChange={handleSignupChange}
              readOnly={!inputUnlocked}
              onFocus={() => setInputUnlocked(true)}
              autoComplete="off"
              minLength={2}
              required
            />

            {/* EMAIL INPUT + VERIFY BUTTON */}
            <div className="email-verify-row">
              <input
                type="email"
                name="email"
                placeholder="AKGEC Email"
                value={signupData.email}
                onChange={handleSignupChange}
                readOnly={!inputUnlocked || isEmailVerified}
                onFocus={() => setInputUnlocked(true)}
                autoComplete="off"
                required
              />
              {isEmailVerified ? (
                <span className="verified-badge">
                  <FaCheckCircle aria-hidden="true" /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  className="verify-email-btn"
                  onClick={() => handleSendOtp(false)}
                  disabled={loading || !signupData.email}
                >
                  {loading ? "..." : "Verify"}
                </button>
              )}
            </div>
            <span className="email-hint">
              Official email required: name12345@akgec.ac.in
            </span>

            {/* SIGNUP PASSWORD WITH EYE TOGGLE */}
            <div className="password-input-wrapper">
              <input
                type={showSignupPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 8 chars)"
                value={signupData.password}
                onChange={handleSignupChange}
                readOnly={!inputUnlocked}
                onFocus={() => setInputUnlocked(true)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={
                  showSignupPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowSignupPassword((prev) => !prev)}
              >
                {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* CONFIRM PASSWORD WITH EYE TOGGLE */}
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                readOnly={!inputUnlocked}
                onFocus={() => setInputUnlocked(true)}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label className="role-label" htmlFor="signup-role">
              Sign up as
            </label>
            <select
              id="signup-role"
              className="role-select"
              value={signupRole}
              onChange={(e) => setSignupRole(e.target.value)}
            >
              <option value="STUDENT">Student</option>
              <option value="MENTOR">Mentor</option>
            </select>
            <button className="auth-button" type="submit" disabled={loading}>
              SIGN UP
            </button>
          </form>
        </div>

        {/* WELCOME SLIDING PANEL */}
        <div className="welcome-panel">
          {!isSignup ? (
            <div className="welcome-content">
              <h2>
                Welcome To
                <br />
                The SocietySelect
              </h2>
              <p>New Here?</p>
              <button
                className="switch-button"
                onClick={() => {
                  setErrorMsg("");
                  setInfoMsg("");
                  setIsSignup(true);
                }}
              >
                SIGN UP
              </button>
            </div>
          ) : (
            <div className="welcome-content">
              <h2>
                Welcome back To
                <br />
                The SocietySelect
              </h2>
              <p className="existing-account-prompt">Already have an account?</p>
              <button
                className="switch-button"
                onClick={() => {
                  setErrorMsg("");
                  setInfoMsg("");
                  setIsSignup(false);
                }}
              >
                SIGN IN
              </button>
            </div>
          )}
        </div>
      </div>

      {/* OTP SUBMISSION POPUP */}
      {showOtpModal && (
        <div className="profile-modal-overlay">
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-modal-title"
          >
            <button
              className="profile-modal-close"
              type="button"
              aria-label="Close OTP form"
              onClick={() => setShowOtpModal(false)}
            >
              <FaTimes aria-hidden="true" />
            </button>
            <h2 id="otp-modal-title">Verify College Email</h2>
            <p>
              Enter the 6-digit OTP sent to <strong>{signupData.email}</strong>
            </p>
            {errorMsg && <p className="auth-error-banner">{errorMsg}</p>}
            <form onSubmit={handleVerifyOtp} autoComplete="off">
              <label htmlFor="otp-code">6-Digit OTP</label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="e.g. 123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <div className="otp-actions">
                <button
                  className="auth-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "VERIFYING..." : "VERIFY OTP"}
                </button>
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={() => handleSendOtp(true)}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* DOMAIN & STUDENT NUMBER POPUP */}
      {showProfileForm && (
        <div className="profile-modal-overlay">
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
          >
            <button
              className="profile-modal-close"
              type="button"
              aria-label="Close profile form"
              onClick={() => setShowProfileForm(false)}
            >
              <FaTimes aria-hidden="true" />
            </button>
            <h2 id="profile-modal-title">Complete Your Registration</h2>
            <p>
              Enter your details and AKGEC student number
              {(pendingGoogleToken ? modalRole : signupRole) === "MENTOR"
                ? " (verified against the Society Mentor Registry)."
                : "."}
            </p>
            {errorMsg && <p className="auth-error-banner">{errorMsg}</p>}
            <form onSubmit={handleProfileSubmit} autoComplete="off">
              {/* Let Google OAuth users explicitly choose Student or Mentor */}
              {pendingGoogleToken && (
                <>
                  <label htmlFor="profile-role">Register As</label>
                  <select
                    id="profile-role"
                    className="role-select"
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="MENTOR">Mentor</option>
                  </select>
                </>
              )}
              
              <label htmlFor="profile-domain">Domain</label>
              <input
                id="profile-domain"
                name="domain"
                type="text"
                placeholder="e.g. Web Development, AI/ML, Big Data"
                value={signupData.domain}
                onChange={handleSignupChange}
                minLength={2}
                required
              />
              <label htmlFor="profile-student-number">Student Number</label>
              <input
                id="profile-student-number"
                name="studentNumber"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{3,20}"
                placeholder="e.g. 2410012 (digits only)"
                value={signupData.studentNumber}
                onChange={handleSignupChange}
                required
              />
              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "SUBMITTING..." : "COMPLETE SIGN UP"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
