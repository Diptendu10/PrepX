
import React, { useState } from "react";

function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeOption, setActiveOption] = useState("My Attempts");

  const menuOptions = [
    "My Attempts",
    "Book an Interview",
    "View Schedule",
    "Improvement Needed",
  ];

  const handleLogout = () => {
    // Replace this with your actual logout logic
    window.location.href = "/login";
  };

  const handleSettings = () => {
    // Replace this with your settings page route
    window.location.href = "/settings";
  };

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

        {/* Profile Menu */}
        <div className="dashboard-profile">
          <button
            className="profile-circle"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            U
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <button onClick={handleSettings}>
                Settings
              </button>

              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-heading">Dashboard</h3>

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
            <h1>Welcome Back!</h1>
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
