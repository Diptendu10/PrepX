import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { getAdminInterviewSchedules } from "./services/interviews.js";

function formatDateTime(dateTime) {
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
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export default function AdminInterviewList() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCompletedView = pathname === "/admin/completed";
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSchedules() {
      try {
        const records = await getAdminInterviewSchedules();
        if (isMounted) {
          setSchedules(records);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "Unable to load interviews.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleSchedules = useMemo(() => {
    const matchingSchedules = schedules.filter((schedule) => {
      const isCompleted = schedule.status === "completed";
      return isCompletedView ? isCompleted : true;
    });

    return matchingSchedules.sort(
      (first, second) =>
        new Date(second.bookedAt || second.createdAt).getTime() -
        new Date(first.bookedAt || first.createdAt).getTime()
    );
  }, [isCompletedView, schedules]);

  const title = isCompletedView ? "Completed Interviews" : "Total Interviews";

  return (
    <main className="admin-queries-page">
      <header className="queries-header">
        <div className="queries-header-left">
          <button
            type="button"
            className="queries-back-button"
            onClick={() => navigate("/admin")}
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1>{title}</h1>
            <p>
              {isCompletedView
                ? "Review completed interview sessions."
                : "View all booked interview sessions."}
            </p>
          </div>
        </div>
        <div className="queries-count">
          <CalendarDays size={18} />
          <span>{visibleSchedules.length} Interviews</span>
        </div>
      </header>

      <section className="queries-content">
        <div className="queries-list-heading">
          <div>
            <h2>{isCompletedView ? "Completed" : "All Interviews"}</h2>
            <p>
              Interview booking and scheduled times are shown in Indian
              Standard Time (IST).
            </p>
          </div>
        </div>

        <div className="queries-table-wrapper">
          <table className="queries-table admin-schedule-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Category</th>
                <th>Booked At</th>
                <th>Interview Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleSchedules.filter(Boolean).map((schedule, index) => (
                <tr key={schedule._id || `interview-${index}`}>
                  <td>
                    <div className="query-user-cell">
                      <span className="query-user-avatar">
                        {(schedule.userName || "U").charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {schedule.userName || "User"}
                        <small>
                          {schedule.userEmail || "Email unavailable"}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="query-topic">
                      {schedule.category || "Interview"}
                    </span>
                    <small className="admin-schedule-difficulty">
                      {schedule.difficulty || "Level not specified"}
                    </small>
                  </td>
                  <td>
                    <span className="query-date">
                      <Clock3 size={15} />
                      {formatDateTime(schedule.bookedAt || schedule.createdAt)}
                    </span>
                  </td>
                  <td>
                    <span className="query-date">
                      <CalendarDays size={15} />
                      {formatDateTime(schedule.scheduledAt)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`query-status ${
                        schedule.status === "completed"
                          ? "query-status-solved"
                          : "query-status-pending"
                      }`}
                    >
                      {schedule.status || "scheduled"}
                    </span>
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan="5" className="queries-empty">
                    Loading interviews...
                  </td>
                </tr>
              )}

              {!isLoading && loadError && (
                <tr>
                  <td colSpan="5" className="queries-empty" role="alert">
                    {loadError}
                  </td>
                </tr>
              )}

              {!isLoading && !loadError && visibleSchedules.length === 0 && (
                <tr>
                  <td colSpan="5" className="queries-empty">
                    {isCompletedView
                      ? "No completed interviews yet."
                      : "No interview bookings yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
