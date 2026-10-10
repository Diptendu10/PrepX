import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getSessionUser } from "./session.js";

export default function AccountMenu({ showDashboard = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const firstLetter = getSessionUser()?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  function handleLogout() {
    sessionStorage.removeItem("prepx_token");
    sessionStorage.removeItem("prepx_user");
    window.location.assign("/");
  }

  function handleSettings() {
    setIsOpen(false);
    window.location.assign("/settings");
  }

  return (
    <div className="account-menu">
      <button
        className="profile-circle"
        type="button"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {firstLetter}
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          {showDashboard && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          )}
          <button type="button" onClick={handleSettings}>
            Settings
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
