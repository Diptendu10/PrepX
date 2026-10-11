
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMenu from "./AccountMenu.jsx";
import { getSessionUser } from "./session.js";
import {
  getUserQuerySolutions,
  submitQueryRequest,
} from "./services/queries.js";
import { getUserInterviewSchedules } from "./services/interviews.js";

function formatScheduleDateTime(dateTime) {
  if (!dateTime) {
    return "Date and time unavailable";
  }

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) {
    return "Date and time unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function Dashboard() {
  const navigate = useNavigate();
  const [activeOption, setActiveOption] = useState("My Attempts");
  const [queryCategory, setQueryCategory] = useState("");
  const [queryMessage, setQueryMessage] = useState(null);
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [userQueries, setUserQueries] = useState([]);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const [solutionsError, setSolutionsError] = useState("");
  const [interviewSchedules, setInterviewSchedules] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const firstName = getSessionUser()?.name?.trim()?.split(/\s+/)[0] || "there";

  const menuOptions = [
    "My Attempts",
    "Book an Interview",
    "View Schedule",
    "Improvement Needed",
    "Request for Query",
    "Solutions",
  ];

  useEffect(() => {
    if (activeOption !== "Solutions") {
      return undefined;
    }

    let isMounted = true;

    async function loadSolutions() {
      try {
        const queries = await getUserQuerySolutions();
        if (isMounted) {
          setUserQueries(queries);
          setSolutionsError("");
        }
      } catch (error) {
        if (isMounted) {
          setSolutionsError(
            error.message || "Unable to load your solutions."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSolutions(false);
        }
      }
    }

    setIsLoadingSolutions(true);
    loadSolutions();
    const refreshInterval = window.setInterval(loadSolutions, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, [activeOption]);

  useEffect(() => {
    if (activeOption !== "View Schedule") {
      return undefined;
    }

    let isMounted = true;

    async function loadSchedule() {
      try {
        const schedules = await getUserInterviewSchedules();
        if (isMounted) {
          setInterviewSchedules(schedules);
          setScheduleError("");
        }
      } catch (error) {
        if (isMounted) {
          setScheduleError(
            error.message || "Unable to load your interview schedule."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSchedule(false);
        }
      }
    }

    setIsLoadingSchedule(true);
    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [activeOption]);

  async function handleQuerySubmit(event) {
    event.preventDefault();
    setQueryMessage(null);
    setIsSubmittingQuery(true);

    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);

    try {
      await submitQueryRequest({
        category: queryCategory,
        interviewType:
          queryCategory === "interview"
            ? formData.get("interviewType")
            : undefined,
        question: formData.get("question"),
      });
      form.reset();
      setQueryCategory("");
      setQueryMessage({
        type: "success",
        text: "Your query has been submitted. Our team will get back to you.",
      });
    } catch (error) {
      setQueryMessage({
        type: "error",
        text: error.message || "Unable to submit your query. Please try again.",
      });
    } finally {
      setIsSubmittingQuery(false);
    }
  }

  return (
    <div className="dashboard-page">
      {/* Top Navbar */}
      <header className="dashboard-navbar">
        <div className="dashboard-brand">
          <button
            className="dashboard-nav-toggle"
            aria-label="Toggle navigation"
            onClick={() =>
              document
                .querySelector(".dashboard-sidebar")
                ?.classList.toggle("sidebar-open")
            }
          >
            ☰
          </button>

          <a href="/" className="dashboard-logo">
            PrepX
          </a>
        </div>

        <AccountMenu />
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <nav className="dashboard-menu">
            {menuOptions.map((option) => (
              <button
                key={option}
                className={`dashboard-menu-item ${
                  activeOption === option ? "active" : ""
                }`}
                onClick={() => {
                  setActiveOption(option);
                  document
                    .querySelector(".dashboard-sidebar")
                    ?.classList.remove("sidebar-open");
                }}
              >
                {option}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="dashboard-welcome">
            <p className="dashboard-eyebrow">PREPX DASHBOARD</p>
            <h1>Welcome Back, {firstName}!</h1>
            <p>
              Ready to prepare, practice, and perform better in your
              next interview?
            </p>
          </div>

          <section className="dashboard-section">
            <h2>{activeOption}</h2>

            {activeOption === "My Attempts" && (
              <div className="dashboard-placeholder">
                <h3>Your Interview Attempts</h3>
                <p>
                  Review your previous practice interviews, scores,
                  and performance.
                </p>
                <p>No attempts to display yet.</p>
              </div>
            )}

            {activeOption === "Book an Interview" && (
              <div className="dashboard-placeholder">
                <h3>Book Your Next Interview</h3>
                <p>
                  Choose an interview practice session that matches
                  your preparation goals.
                </p>
                <button
                  className="dashboard-primary-button"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Explore Interviews
                </button>
              </div>
            )}

            {activeOption === "View Schedule" && (
              <div className="dashboard-schedule-list">
                {isLoadingSchedule && interviewSchedules.length === 0 && (
                  <p className="dashboard-solutions-message" role="status">
                    Loading your schedule...
                  </p>
                )}

                {scheduleError && (
                  <p className="dashboard-solutions-message error" role="alert">
                    {scheduleError}
                  </p>
                )}

                {!isLoadingSchedule &&
                  !scheduleError &&
                  interviewSchedules.length === 0 && (
                    <div className="dashboard-placeholder">
                      <h3>No interviews scheduled</h3>
                      <p>
                        Book an interview and it will appear here with its
                        scheduled date and time.
                      </p>
                    </div>
                  )}

                {interviewSchedules.filter(Boolean).map((schedule, index) => (
                  <article
                    className="dashboard-schedule-card"
                    key={schedule._id || `schedule-${index}`}
                  >
                    <div className="dashboard-schedule-card-heading">
                      <h3>{schedule.category || "Interview"}</h3>
                      <span>{schedule.difficulty || "Level not specified"}</span>
                    </div>
                    <p>
                      <strong>Interview time:</strong>{" "}
                      {formatScheduleDateTime(schedule.scheduledAt)}
                    </p>
                  </article>
                ))}
              </div>
            )}

            {activeOption === "Improvement Needed" && (
              <div className="dashboard-placeholder">
                <h3>Your Improvement Areas</h3>
                <p>
                  Identify skills to work on based on your interview
                  performance and feedback.
                </p>
                <p>Your improvement report will appear here.</p>
              </div>
            )}

            {activeOption === "Request for Query" && (
              <div className="dashboard-query-card">
                <div className="dashboard-query-intro">
                  <h3>How can we help?</h3>
                  <p>
                    Choose a topic and tell us what you need help with.
                  </p>
                </div>

                <form
                  className="dashboard-query-form"
                  onSubmit={handleQuerySubmit}
                >
                  <label htmlFor="query-category">Query category</label>
                  <select
                    id="query-category"
                    name="category"
                    value={queryCategory}
                    onChange={(event) => setQueryCategory(event.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="account">Account related queries</option>
                    <option value="interview">
                      Queries related to interview
                    </option>
                    <option value="payment">Payment issue</option>
                  </select>

                  {queryCategory === "interview" && (
                    <>
                      <label htmlFor="query-interview-type">
                        Interview type
                      </label>
                      <select
                        id="query-interview-type"
                        name="interviewType"
                        defaultValue=""
                        required
                      >
                        <option value="" disabled>
                          Select an interview type
                        </option>
                        <option value="past">Past Interviews</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </>
                  )}

                  <label htmlFor="query-question">Your question</label>
                  <textarea
                    id="query-question"
                    name="question"
                    placeholder="Describe your question or issue..."
                    rows="5"
                    maxLength="2000"
                    required
                  />

                  {queryMessage && (
                    <p
                      className={`dashboard-query-message ${queryMessage.type}`}
                      role={queryMessage.type === "error" ? "alert" : "status"}
                    >
                      {queryMessage.text}
                    </p>
                  )}

                  <button
                    className="dashboard-primary-button"
                    type="submit"
                    disabled={isSubmittingQuery}
                  >
                    {isSubmittingQuery ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            )}

            {activeOption === "Solutions" && (
              <div className="dashboard-solutions-list">
                {isLoadingSolutions && userQueries.length === 0 && (
                  <p className="dashboard-solutions-message" role="status">
                    Loading your queries...
                  </p>
                )}

                {solutionsError && (
                  <p className="dashboard-solutions-message error" role="alert">
                    {solutionsError}
                  </p>
                )}

                {!isLoadingSolutions &&
                  !solutionsError &&
                  userQueries.length === 0 && (
                    <div className="dashboard-placeholder">
                      <h3>No queries yet</h3>
                      <p>
                        Submit a query and any response from our team will
                        appear here.
                      </p>
                    </div>
                  )}

                {userQueries.map((query) => (
                  <article className="dashboard-solution-card" key={query._id}>
                    <div className="dashboard-solution-heading">
                      <div>
                        <h3>
                          {query.category === "account"
                            ? "Account related query"
                            : query.category === "payment"
                              ? "Payment issue"
                              : `Interview query${
                                  query.interviewType
                                    ? ` - ${
                                        query.interviewType === "past"
                                          ? "Past Interviews"
                                          : "Scheduled"
                                      }`
                                    : ""
                                }`}
                        </h3>
                        <span
                          className={`query-status ${
                            query.status === "closed" ||
                            query.status === "resolved"
                              ? "query-status-solved"
                              : "query-status-pending"
                          }`}
                        >
                          {query.status === "closed" ||
                          query.status === "resolved"
                            ? "Closed"
                            : "Open"}
                        </span>
                      </div>
                      <time dateTime={query.createdAt}>
                        {new Intl.DateTimeFormat(undefined, {
                          dateStyle: "medium",
                        }).format(new Date(query.createdAt))}
                      </time>
                    </div>

                    <div className="dashboard-solution-question">
                      <span>Your question</span>
                      <p>{query.question}</p>
                    </div>

                    {query.solution ? (
                      <div className="dashboard-solution-answer">
                        <h4>Solution</h4>
                        <p>{query.solution}</p>
                      </div>
                    ) : (
                      <p className="dashboard-solution-pending">
                        {query.status === "closed"
                          ? "This query is closed, but its feedback is not available."
                          : "Our team has not replied yet."}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
