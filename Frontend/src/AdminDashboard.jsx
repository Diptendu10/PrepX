import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Code2,
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  MessageCircle,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Read the logged-in admin's details from session storage.
  const storedAdmin = sessionStorage.getItem("prepx_admin");

  let admin = {};

  try {
    admin = storedAdmin ? JSON.parse(storedAdmin) : {};
  } catch {
    admin = {};
  }

  const adminName =
    admin.name ||
    admin.fullName ||
    admin.username ||
    admin.email?.split("@")[0] ||
    "Admin";

  const firstLetter = adminName.trim().charAt(0).toUpperCase() || "A";

  function handleLogout() {
    sessionStorage.removeItem("prepx_admin");
    sessionStorage.removeItem("prepx_admin_token");
    navigate("/login");
  }

  return (
    <main className="admin-dashboard">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <a href="/admin" className="admin-brand">
          <span className="admin-brand-icon">
            <Code2 size={23} />
          </span>

          <span>
            Prep<span className="admin-brand-highlight">X</span>
            <small>ADMIN PANEL</small>
          </span>
        </a>

        {/* Navbar navigation buttons */}
        <nav className="admin-nav-links" aria-label="Admin navigation">
          <button
            type="button"
            className="admin-nav-button"
            onClick={() => navigate("/admin/interviews")}
          >
            <LayoutDashboard size={18} />
            <span>Total Interviews</span>
          </button>

          <button
            type="button"
            className="admin-nav-button"
            onClick={() => navigate("/admin/completed")}
          >
            <CheckCircle2 size={18} />
            <span>Completed</span>
          </button>

          <button
            type="button"
            className="admin-nav-button"
            onClick={() => navigate("/admin/scheduled")}
          >
            <CalendarDays size={18} />
            <span>Scheduled</span>
          </button>

          <button
            type="button"
            className="admin-nav-button"
            onClick={() => navigate("/admin/queries")}
          >
            <MessageCircle size={18} />
            <span>Queries</span>
          </button>
        </nav>

        {/* Admin profile */}
        <div className="admin-profile-container">
          <button
            type="button"
            className="admin-profile-circle"
            onClick={() => setShowProfileMenu((previous) => !previous)}
            aria-label="Open admin profile menu"
            aria-expanded={showProfileMenu}
          >
            {firstLetter}
          </button>

          {showProfileMenu && (
            <div className="admin-profile-menu">
              <div className="admin-profile-info">
                <strong>{adminName}</strong>
                <small>{admin.email || "Administrator"}</small>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/settings")}
              >
                <Settings size={16} />
                Settings
              </button>

              <button type="button" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Dashboard content */}
      <section className="admin-dashboard-content">
        <div className="admin-welcome">
          <p className="admin-eyebrow">ADMINISTRATION</p>
          <h1>
            Welcome back, Master!
          </h1>
          <p>
            Manage your interview sessions and keep track of their status.
          </p>
        </div>

        <div className="admin-dashboard-heading">
          <h2>Interview Management</h2>
          <p>Select a category from the navigation bar to continue.</p>
        </div>

        <div className="admin-dashboard-cards">
          <button
            type="button"
            className="admin-dashboard-card"
            onClick={() => navigate("/admin/interviews")}
          >
            <span className="admin-card-icon total-icon">
              <LayoutDashboard size={23} />
            </span>
            <span className="admin-card-title">Total Interviews</span>
            <span className="admin-card-description">
              View all interview sessions
            </span>
            <span className="admin-card-link">View interviews →</span>
          </button>

          <button
            type="button"
            className="admin-dashboard-card"
            onClick={() => navigate("/admin/completed")}
          >
            <span className="admin-card-icon completed-icon">
              <CheckCircle2 size={23} />
            </span>
            <span className="admin-card-title">Completed</span>
            <span className="admin-card-description">
              Review completed interviews
            </span>
            <span className="admin-card-link">View completed →</span>
          </button>

          <button
            type="button"
            className="admin-dashboard-card"
            onClick={() => navigate("/admin/scheduled")}
          >
            <span className="admin-card-icon scheduled-icon">
              <CalendarDays size={23} />
            </span>
            <span className="admin-card-title">Scheduled</span>
            <span className="admin-card-description">
              View upcoming interviews
            </span>
            <span className="admin-card-link">View schedule →</span>
          </button>

          <button
            type="button"
            className="admin-dashboard-card"
            onClick={() => navigate("/admin/queries")}
          >
            <span className="admin-card-icon queries-icon">
              <MessageCircle size={23} />
            </span>
            <span className="admin-card-title">Queries</span>
            <span className="admin-card-description">
              Review and respond to user queries
            </span>
            <span className="admin-card-link">View queries →</span>
          </button>
        </div>
      </section>
    </main>
  );
}