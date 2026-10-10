
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./Homepage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import About from "./About.jsx";
import Dashboard from "./Dashboard.jsx";
import "./styles.css";

const routes = (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {routes}
  </React.StrictMode>
);
