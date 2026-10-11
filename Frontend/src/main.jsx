
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { expireSession, isTokenExpired } from "./session.js";

import App from "./Homepage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import About from "./About.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminQueries from "./AdminQueries.jsx";
import AdminSchedule from "./AdminSchedule.jsx";
import AdminInterviewList from "./AdminInterviewList.jsx";
import PrivateInterviews from "./PrivateInterviews.jsx";
import GovernmentInterviews from "./GovernmentInterviews.jsx";
import InterviewInterface from "./InterviewInterface.jsx";
import "./styles.css";

function SessionExpiryWatcher() {
  useEffect(() => {
    function checkSessionExpiry() {
      for (const tokenKey of ["prepx_token", "prepx_admin_token"]) {
        const token = sessionStorage.getItem(tokenKey);
        if (token && isTokenExpired(token)) {
          expireSession(tokenKey);
          return;
        }
      }
    }

    const expiryCheck = window.setInterval(checkSessionExpiry, 1000);
    document.addEventListener("visibilitychange", checkSessionExpiry);

    return () => {
      window.clearInterval(expiryCheck);
      document.removeEventListener("visibilitychange", checkSessionExpiry);
    };
  }, []);

  return null;
}

const routes = (
  <BrowserRouter>
    <SessionExpiryWatcher />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/queries" element={<AdminQueries />} />
      <Route path="/admin/scheduled" element={<AdminSchedule />} />
      <Route path="/admin/interviews" element={<AdminInterviewList />} />
      <Route path="/admin/completed" element={<AdminInterviewList />} />
      <Route path="/private-interviews" element={<PrivateInterviews />} />
      <Route path="/government-interviews" element={<GovernmentInterviews />} />
      <Route path="/interview/:id" element={<InterviewInterface />} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {routes}
  </React.StrictMode>
);
