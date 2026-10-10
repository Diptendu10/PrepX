import React, { useState } from "react";
import {
  ArrowRight,
  Code2,
  X,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "./services/auth";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData
      .get("confirmPassword")
      ?.toString();

    // Validate password confirmation.
    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupUser({
        name,
        email,
        password,
      });

      setMessage(result.message || "Account created successfully!");
      setMessageType("success");
      window.alert("Signup complete!");

      form.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Give the user a moment to read the success message.
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setMessage(
        error.message || "Unable to create your account. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
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

      <section className="auth-layout signup-layout">
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
              START STRONG. GROW EVERY DAY.
            </span>

            <h1>
              Your future is worth{" "}
              <span className="gradient-text">preparing for.</span>
            </h1>

            <p>
              Create your PrepX account and start building skills for
              your next opportunity.
            </p>

            <div className="auth-quote">
              <span>“</span>
              <p>
                Confidence grows when preparation becomes a habit.
              </p>
            </div>
          </div>

          <span className="auth-copyright">
            © {new Date().getFullYear()} PrepX. All rights reserved.
          </span>
        </aside>

        {/* Signup form section */}
        <section
          className="auth-panel"
          aria-labelledby="signup-title"
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
              <UserPlus size={23} />
            </div>

            <p className="auth-overline">
              JOIN THE PREPX COMMUNITY
            </p>

            <h2 id="signup-title">Create your account</h2>

            <p className="auth-subtitle">
              A few details and you're ready to get started.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Create password

                <span className="password-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    minLength={8}
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

              <label>
                Confirm password

                <span className="password-wrap">
                  <input
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </span>
              </label>

              <label className="remember-label signup-terms">
                <input type="checkbox" name="terms" required />
                <span>
                  I agree to the{" "}
                  <a href="/#contact">Terms &amp; Conditions</a>.
                </span>
              </label>

              {/* Display backend responses and validation errors */}
              {message && (
                <p
                  className={`auth-message ${
                    messageType === "success"
                      ? "auth-message-success"
                      : "auth-message-error"
                  }`}
                  role="status"
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
                    ? "Creating account..."
                    : "Create account"}
                </span>

                {!isLoading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="auth-switch-copy">
              Already have an account?{" "}
              <a href="/login">Log in</a>
            </p>

            <p className="auth-legal">
              Your details are sent to PrepX's backend for account
              creation. Passwords should be hashed by the server
              before being stored.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}