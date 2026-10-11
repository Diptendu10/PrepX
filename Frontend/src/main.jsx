
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import "./styles.css";

const routes = (
  <BrowserRouter>
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
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {routes}
  </React.StrictMode>
);
