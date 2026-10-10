
import React, { useState } from "react";
import AccountMenu from "./AccountMenu.jsx";
import { getSessionUser } from "./session.js";

function Dashboard() {
  const [activeOption, setActiveOption] = useState("My Attempts");
  const firstName = getSessionUser()?.name?.trim()?.split(/\s+/)[0] || "there";

  const menuOptions = [
    "My Attempts",
    "Book an Interview",
    "View Schedule",
    "Improvement Needed",
  ];

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
                <button className="dashboard-primary-button">
                  Explore Interviews
                </button>
              </div>
            )}

            {activeOption === "View Schedule" && (
              <div className="dashboard-placeholder">
                <h3>Your Schedule</h3>
                <p>
                  View your upcoming interviews and planned practice
                  sessions here.
                </p>
                <p>No scheduled interviews yet.</p>
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
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
