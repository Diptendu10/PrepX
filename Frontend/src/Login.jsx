import React, { useState } from "react";
import {
  ArrowRight,
  Code2,
  X,
  ShieldCheck,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./services/auth";

export default function Login() {
  const [adminMode, setAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    // Admin login is kept separate from regular user authentication.
    if (adminMode) {
      setMessage(
        "Admin authentication is not connected yet. Please connect a separate admin login endpoint."
      );
      return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const result = await loginUser(credentials);

      // Save the authentication token and logged-in user.
      sessionStorage.setItem("prepx_token", result.token);
      sessionStorage.setItem(
        "prepx_user",
        JSON.stringify(result.user)
      );

      window.alert("Login successful!");

      // Redirect after successful login.
      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.message || "Unable to log in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleLoginMode() {
    setAdminMode((previousMode) => !previousMode);
    setShowPassword(false);
    setMessage("");
  }

  return (
    <main className="auth-page">
      <a
        className="auth-close"
        href="/"
        aria-label="Return to homepage"
        title="Back to homepage"
      >
        <X size={22} />
      </a>

      <section className="auth-layout">
        {/* Left showcase section */}
        <aside className="auth-showcase">
          <a
            className="auth-brand"
            href="/"
            aria-label="PrepX homepage"
          >
            <span className="brand-mark">
              <Code2 size={23} strokeWidth={2.6} />
            </span>

            <span className="brand-copy">
              <strong>
                Prep<span>X</span>
              </strong>
              <small>Your Interview, OUR Platform</small>
            </span>
          </a>

          <div className="auth-showcase-copy">
            <span className="auth-kicker">
              YOUR NEXT CHAPTER STARTS HERE
            </span>

            <h1>
              Make your next interview{" "}
              <span className="gradient-text">your best one.</span>
            </h1>

            <p>
              Practice with purpose, build your confidence, and
              prepare for the opportunities ahead.
            </p>

            <div className="auth-benefit">
              <span>01</span>
              <div>
                <strong>Practice on your terms</strong>
                <small>Make progress at your own pace.</small>
              </div>
            </div>

            <div className="auth-benefit">
              <span>02</span>
              <div>
                <strong>Prepare with purpose</strong>
                <small>Keep your career goals in sight.</small>
              </div>
            </div>
          </div>

          <span className="auth-copyright">
            © {new Date().getFullYear()} PrepX. All rights reserved.
          </span>
        </aside>

        {/* Login form section */}
        <section
          className="auth-panel"
          aria-labelledby="login-title"
        >
          <div className="auth-mobile-brand">
            <span className="brand-mark">
              <Code2 size={22} />
            </span>
            <strong>
              Prep<span>X</span>
            </strong>
          </div>

          <div className="auth-form-wrap">
            <div className="auth-heading-icon">
              {adminMode ? (
                <ShieldCheck size={23} />
              ) : (
                <UserRound size={23} />
              )}
            </div>

            <p className="auth-overline">
              {adminMode
                ? "ADMINISTRATOR ACCESS"
                : "WELCOME BACK"}
            </p>

            <h2 id="login-title">
              {adminMode ? "Admin login" : "Log in to PrepX"}
            </h2>

            <p className="auth-subtitle">
              {adminMode
                ? "Sign in with your authorized admin credentials."
                : "Pick up where your preparation left off."}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {adminMode && (
                <label>
                  Admin ID
                  <input
                    name="adminId"
                    type="text"
                    placeholder="Enter your admin ID"
                    autoComplete="username"
                    required
                  />
                </label>
              )}

              <label>
                {adminMode ? "Admin email" : "Email address"}
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password

                <span className="password-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </span>
              </label>

              <div className="auth-form-meta">
                <label className="remember-label">
                  <input type="checkbox" name="rememberMe" />
                  <span>Remember me</span>
                </label>

                <a href="mailto:support@prepx.example?subject=Password%20reset">
                  Forgot password?
                </a>
              </div>

              {/* Backend response and validation errors */}
              {message && (
                <p
                  className="auth-message"
                  role="alert"
                  aria-live="polite"
                >
                  {message}
                </p>
              )}

              <button
                className="button button-primary auth-submit"
                type="submit"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Logging in..."
                    : adminMode
                      ? "Admin login"
                      : "Log in"}
                </span>

                {!isLoading && <ArrowRight size={17} />}
              </button>
            </form>

            {!adminMode && (
              <p className="auth-switch-copy">
                Don't have an account?{" "}
                <a href="/signup">Sign up</a>
              </p>
            )}

            <button
              type="button"
              className={`admin-alternative ${
                adminMode ? "admin-alternative-active" : ""
              }`}
              onClick={toggleLoginMode}
            >
              <ShieldCheck size={18} />

              <span>
                {adminMode
                  ? "Back to user login"
                  : "Admin login"}
              </span>

              <ArrowRight size={16} />
            </button>

            {adminMode && (
              <p className="admin-note">
                Admin access is intended only for authorized PrepX
                administrators.
              </p>
            )}

            <p className="auth-legal">
              By continuing, you agree to PrepX's{" "}
              <a href="/#contact">Terms &amp; Conditions</a>.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
