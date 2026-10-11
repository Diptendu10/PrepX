import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function AdminSchedule() {
  const navigate = useNavigate();
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
          setLoadError(error.message || "Unable to load the schedule.");
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
            <h1>Interview Schedule</h1>
            <p>View booked interviews and their scheduled dates and times.</p>
          </div>
        </div>
        <div className="queries-count">
          <CalendarDays size={18} />
          <span>{schedules.length} Bookings</span>
        </div>
      </header>

      <section className="queries-content">
        <div className="queries-list-heading">
          <div>
            <h2>All Bookings</h2>
            <p>Interview times are shown in Indian Standard Time (IST).</p>
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
              </tr>
            </thead>
            <tbody>
              {schedules.filter(Boolean).map((schedule, index) => (
                <tr key={schedule._id || `schedule-${index}`}>
                  <td>
                    <div className="query-user-cell">
                      <span className="query-user-avatar">
                        {(schedule.userName || "U").charAt(0).toUpperCase()}
                      </span>
                      <span>
                        {schedule.userName || "User"}
                        <small>{schedule.userEmail || "Email unavailable"}</small>
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
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan="4" className="queries-empty">
                    Loading interview schedule...
                  </td>
                </tr>
              )}

              {!isLoading && loadError && (
                <tr>
                  <td colSpan="4" className="queries-empty" role="alert">
                    {loadError}
                  </td>
                </tr>
              )}

              {!isLoading && !loadError && schedules.length === 0 && (
                <tr>
                  <td colSpan="4" className="queries-empty">
                    No interview bookings yet.
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
