import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
ArrowLeft,
Search,
MessageSquareText,
CalendarDays,
UserRound,
X,
ArrowRight,
CheckCircle2,
Send,
} from "lucide-react";
import {
  getAdminQueries,
  sendQueryFeedback,
} from "./services/adminQueries.js";

export default function AdminQueries() {
const navigate = useNavigate();

const [queries, setQueries] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [selectedQuery, setSelectedQuery] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [isGivingFeedback, setIsGivingFeedback] = useState(false);
const [feedback, setFeedback] = useState("");
const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
const [feedbackMessage, setFeedbackMessage] = useState("");

useEffect(() => {
  let isMounted = true;

  async function loadQueries() {
    try {
      const savedQueries = await getAdminQueries();
      if (isMounted) {
        setQueries(savedQueries);
      }
    } catch (error) {
      if (isMounted) {
        setLoadError(error.message || "Unable to load user queries.");
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }

  loadQueries();

  return () => {
    isMounted = false;
  };
}, []);

const search = searchTerm.trim().toLocaleLowerCase();
const filteredQueries = [...queries]
  .sort((first, second) => {
    const firstIsClosed =
      first.status === "closed" || first.status === "resolved";
    const secondIsClosed =
      second.status === "closed" || second.status === "resolved";

    if (firstIsClosed !== secondIsClosed) {
      return firstIsClosed ? 1 : -1;
    }

    return new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime();
  })
  .filter((query) => {
    if (!search) {
      return true;
    }

    return [
      query.userName,
      query.userEmail,
      query.question,
      getQueryCategory(query),
    ].some((value) => value.toLocaleLowerCase().includes(search));
  });

function getQueryCategory(query) {
  const categories = {
    account: "Account related queries",
    interview: `Interview query${
      query.interviewType
        ? ` - ${query.interviewType === "past" ? "Past Interviews" : "Scheduled"}`
        : ""
    }`,
    payment: "Payment issue",
  };

  return categories[query.category] || "Other";
}

function getQueryDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function openQuery(query) {
setSelectedQuery(query);
setFeedback("");
setFeedbackMessage("");
setIsGivingFeedback(false);
}

function closePopup() {
setSelectedQuery(null);
setFeedback("");
setFeedbackMessage("");
setIsGivingFeedback(false);
}

async function handleFeedbackSubmit(event) {
  event.preventDefault();
  setFeedbackMessage("");
  setIsSubmittingFeedback(true);

  try {
    const result = await sendQueryFeedback(
      selectedQuery._id,
      feedback
    );
    const updatedQuery = {
      ...selectedQuery,
      status: "closed",
      feedback: result.feedback,
    };

    setQueries((previousQueries) =>
      previousQueries.map((query) =>
        query._id === updatedQuery._id ? updatedQuery : query
      )
    );
    setSelectedQuery(updatedQuery);
    setIsGivingFeedback(false);
    setFeedback("");
    setFeedbackMessage("Feedback sent and query closed.");
  } catch (error) {
    setFeedbackMessage(
      error.message || "Unable to send feedback. Please try again."
    );
  } finally {
    setIsSubmittingFeedback(false);
  }
}

return ( <main className="admin-queries-page">
{/* Header */} <header className="queries-header"> <div className="queries-header-left">
<button
type="button"
className="queries-back-button"
onClick={() => navigate("/admin")}
aria-label="Back to admin dashboard"
> <ArrowLeft size={19} /> </button>


      <div>
        <h1>User Queries</h1>
        <p>Review and resolve questions raised by users.</p>
      </div>
    </div>

    <div className="queries-count">
      <MessageSquareText size={18} />
      <span>{queries.length} Total Queries</span>
    </div>
  </header>

  {/* Search and list */}
  <section className="queries-content">
    <div className="queries-list-heading">
      <div>
        <h2>All Queries</h2>
        <p>Click on a query to view its full description.</p>
      </div>

      <label className="queries-search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search user or query..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </label>
    </div>

    <div className="queries-table-wrapper">
      <table className="queries-table">
        <thead>
          <tr>
            <th>User Name</th>
            <th>Date</th>
            <th>Query About</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>

        <tbody>
          {filteredQueries.map((query) => (
            <tr
              key={query._id}
              className="queries-table-row"
              onClick={() => openQuery(query)}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openQuery(query);
                }
              }}
            >
              <td>
                <div className="query-user-cell">
                  <span className="query-user-avatar">
                    {query.userName.charAt(0).toUpperCase()}
                  </span>
                  <span>{query.userName}</span>
                </div>
              </td>

              <td>
                <span className="query-date">
                  <CalendarDays size={15} />
                  {getQueryDate(query.createdAt)}
                </span>
              </td>

              <td>
                <span className="query-topic">
                  {getQueryCategory(query)}
                </span>
              </td>

              <td>
                <span
                  className={`query-status ${
                    query.status === "closed" || query.status === "resolved"
                      ? "query-status-solved"
                      : "query-status-pending"
                  }`}
                >
                  {query.status === "closed" || query.status === "resolved"
                    ? "Closed"
                    : "Open"}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="query-view-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openQuery(query);
                  }}
                  aria-label={`View query from ${query.userName}`}
                >
                  View <ArrowRight size={15} />
                </button>
              </td>
            </tr>
          ))}

          {isLoading && (
            <tr>
              <td colSpan="5" className="queries-empty">
                Loading queries...
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

          {!isLoading && !loadError && filteredQueries.length === 0 && (
            <tr>
              <td colSpan="5" className="queries-empty">
                {queries.length === 0
                  ? "No user queries have been submitted yet."
                  : "No queries found matching your search."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  {/* Query details popup */}
  {selectedQuery && (
    <div
      className="query-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closePopup();
        }
      }}
    >
      <section
        className="query-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="query-modal-title"
      >
        <div className="query-modal-header">
          <div>
            <span className="query-modal-eyebrow">
              USER SUPPORT
            </span>
            <h2 id="query-modal-title">Query Details</h2>
          </div>

          <button
            type="button"
            className="query-modal-close"
            onClick={closePopup}
            aria-label="Close query details"
          >
            <X size={21} />
          </button>
        </div>

        <div className="query-modal-body">
          <div className="query-detail-grid">
            <div className="query-detail-item">
              <span className="query-detail-label">
                <UserRound size={15} /> User Name
              </span>
              <strong>{selectedQuery.userName}</strong>
            </div>

            <div className="query-detail-item">
              <span className="query-detail-label">
                <CalendarDays size={15} /> Date Raised
              </span>
              <strong>{getQueryDate(selectedQuery.createdAt)}</strong>
            </div>
          </div>

          <div className="query-description-block">
            <span className="query-detail-label">
              {getQueryCategory(selectedQuery)}
            </span>

            <span className="query-detail-label">
              User email
            </span>
            <p>{selectedQuery.userEmail}</p>

            <span className="query-detail-label">
              Question
            </span>
            <p>{selectedQuery.question}</p>
          </div>

          {selectedQuery.feedback && (
            <div className="query-saved-answer">
              <span className="query-detail-label">
                <CheckCircle2 size={16} />
                Feedback sent
              </span>
              <p>{selectedQuery.feedback}</p>
            </div>
          )}

          {feedbackMessage && (
            <p
              className={`query-feedback ${
                feedbackMessage === "Feedback sent and query closed."
                  ? "query-feedback-success"
                  : ""
              }`}
              role="status"
            >
              {feedbackMessage}
            </p>
          )}

          {!isGivingFeedback &&
            selectedQuery.status !== "closed" &&
            selectedQuery.status !== "resolved" && (
              <button
                type="button"
                className="query-solve-button"
                onClick={() => {
                  setFeedbackMessage("");
                  setIsGivingFeedback(true);
                }}
              >
                <MessageSquareText size={17} />
                Give Feedback
              </button>
            )}

          {isGivingFeedback && (
            <form
              className="query-answer-form"
              onSubmit={handleFeedbackSubmit}
            >
              <label htmlFor="query-feedback">Your feedback to the user</label>
              <textarea
                id="query-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write your response to the user's query..."
                rows={6}
                maxLength={2000}
                required
                autoFocus
              />
              <div className="query-answer-actions">
                <button
                  type="button"
                  className="query-cancel-button"
                  disabled={isSubmittingFeedback}
                  onClick={() => {
                    setIsGivingFeedback(false);
                    setFeedback("");
                    setFeedbackMessage("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="query-submit-button"
                  disabled={isSubmittingFeedback}
                >
                  <Send size={16} />
                  {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </form>
          )}

        </div>
      </section>
    </div>
  )}
</main>


);
}
